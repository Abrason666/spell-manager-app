/**
 * Importa spell mancanti da dnd2024.wikidot.com.
 * Confronta con spells_database.json e aggiunge solo quelli assenti.
 *
 * Uso: npx tsx scripts/import-wikidot-spells.ts
 */

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_PATH = join(__dirname, '..', 'spells_database.json')

// ── Helpers ───────────────────────────────────────────────────────────────────

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s{2,}/g, ' ').trim()
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/['''`]/g, '')
    .replace(/\//g, '-')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

// ── Parser pagina lista ───────────────────────────────────────────────────────

interface SpellBasic {
  name: string; slug: string; wikidot_slug: string; level: number
  school: string; classes: string[]; casting_time: string; range: string
  components: string; duration: string; concentration: boolean; ritual: boolean
}

function parseListPage(html: string): SpellBasic[] {
  const spells: SpellBasic[] = []

  // Il contenuto delle tab è dentro .yui-content — 10 tabelle (cantrip + liv 1-9)
  const contentMatch = html.match(/<div class="yui-content">([\s\S]+)/)
  if (!contentMatch) { console.error('yui-content non trovato'); return [] }

  const tables = contentMatch[1].split(/<table[^>]*>/)
  tables.shift()

  for (let level = 0; level < Math.min(tables.length, 10); level++) {
    const rows = tables[level].split(/<tr[^>]*>/)
    rows.shift() // header row

    for (const row of rows) {
      const nameMatch = row.match(/<a href="\/spell:([^"]+)"[^>]*>([^<]+)<\/a>/)
      if (!nameMatch) continue

      const wikidot_slug = nameMatch[1]
      const name = nameMatch[2].trim()

      const tds = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)]
      if (tds.length < 7) continue

      const school      = stripTags(tds[1][1]).replace(/\*/g, '').trim()
      const classesRaw  = stripTags(tds[2][1]).trim()
      const casting_time = stripTags(tds[3][1]).trim()
      const range       = stripTags(tds[4][1]).trim()
      const components  = stripTags(tds[5][1]).trim()
      const durationRaw = tds[6][1]
      const duration    = stripTags(durationRaw).trim()

      // Concentrazione: wikidot usa <sup>C</sup> nella durata
      const concentration = /<sup>C<\/sup>/i.test(durationRaw)
      const ritual        = casting_time.toLowerCase().includes('ritual')

      const classes = classesRaw
        .split(',').map(c => c.trim().toLowerCase()).filter(Boolean)

      spells.push({ name, slug: toSlug(name), wikidot_slug, level, school,
                    classes, casting_time, range, components, duration,
                    concentration, ritual })
    }
  }

  return spells
}

// ── Parser pagina singolo spell ───────────────────────────────────────────────

async function fetchDescription(wikidotSlug: string): Promise<{
  description: string; higher_levels: string | null
}> {
  try {
    const res = await fetch(`http://dnd2024.wikidot.com/spell:${wikidotSlug}`)
    if (!res.ok) return { description: '', higher_levels: null }
    const html = await res.text()

    // Estrai #page-content
    const contentMatch = html.match(/<div id="page-content">([\s\S]*?)(?:<div id="page-tags"|<div class="page-tags")/)
    if (!contentMatch) return { description: '', higher_levels: null }
    const content = contentMatch[1]

    const paragraphs: string[] = []
    let higher_levels: string | null = null

    for (const m of content.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)) {
      const raw = m[1]
      const text = stripTags(raw).trim()
      if (!text) continue

      // Salta: "Source: ..."
      if (/^Source:/i.test(text)) continue
      // Salta: "Level X School (Classes)" o "School Cantrip (Classes)"
      if (/^(Level \d+|[\w]+ Cantrip)\s+\w+\s+\(/i.test(text)) continue
      // Salta: paragrafo proprietà (contiene "Casting Time:")
      if (/Casting Time:/i.test(text)) continue

      if (/^Using a Higher.Level Spell Slot\./i.test(text)) {
        higher_levels = text.replace(/^Using a Higher.Level Spell Slot\.\s*/i, '').trim()
      } else {
        paragraphs.push(text)
      }
    }

    // Tabelle opzionali (es. Imprisonment con effetti)
    const tableLines: string[] = []
    for (const row of content.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)) {
      const cells = [...row[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g)]
        .map(c => stripTags(c[1]).trim()).filter(Boolean)
      if (cells.length) tableLines.push(cells.join(' | '))
    }
    if (tableLines.length > 1) paragraphs.push(tableLines.slice(1).join('\n'))

    return { description: paragraphs.join('\n\n').trim(), higher_levels }
  } catch {
    return { description: '', higher_levels: null }
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const existing = JSON.parse(readFileSync(DB_PATH, 'utf-8'))
  const existingNames = new Set(existing.map((s: { name: string }) => s.name.toLowerCase()))
  console.log(`📖 DB attuale: ${existing.length} spell\n`)

  console.log('📥 Scarico lista da wikidot...')
  const res = await fetch('http://dnd2024.wikidot.com/spell:all')
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const html = await res.text()
  console.log(`✓ Pagina scaricata (${Math.round(html.length / 1024)} KB)`)

  const allSpells = parseListPage(html)
  console.log(`📋 Spell trovati su wikidot: ${allSpells.length}`)

  const missing = allSpells.filter(s => !existingNames.has(s.name.toLowerCase()))
  console.log(`❌ Spell mancanti: ${missing.length}\n`)

  if (missing.length === 0) {
    console.log('✅ Database già completo!')
    return
  }

  console.log('Spell mancanti:')
  missing.forEach(s => console.log(`  • [Lv.${s.level}] ${s.name} — ${s.school}`))

  console.log('\n📖 Scarico descrizioni...')
  const toAdd = []

  for (let i = 0; i < missing.length; i++) {
    const s = missing[i]
    process.stdout.write(`\r   [${i + 1}/${missing.length}] ${s.name.padEnd(35)}`)

    const { description, higher_levels } = await fetchDescription(s.wikidot_slug)

    toAdd.push({
      slug: s.slug,
      name: s.name,
      level: s.level,
      school: s.school,
      classes: s.classes,
      casting_time: s.casting_time,
      range: s.range,
      components: s.components,
      duration: s.duration,
      concentration: s.concentration,
      ritual: s.ritual,
      description,
      higher_levels,
      source: 'D&D 2024 PHB',
    })

    await sleep(350) // rispettoso del server
  }

  console.log('\n')

  const updated = [...existing, ...toAdd]
  updated.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name))
  writeFileSync(DB_PATH, JSON.stringify(updated, null, 2))

  console.log(`✅ Aggiunti ${toAdd.length} spell — DB ora a ${updated.length} spell totali`)
  console.log(`\nSpell aggiunti:`)
  toAdd.forEach(s => console.log(`  + [Lv.${s.level}] ${s.name} — ${s.school}`))

  const noDesc = toAdd.filter(s => !s.description)
  if (noDesc.length) {
    console.log(`\n⚠ ${noDesc.length} spell senza descrizione (pagina wikidot assente o diversa):`)
    noDesc.forEach(s => console.log(`  ! ${s.name}`))
  }
}

main().catch(err => { console.error('\n', err); process.exit(1) })
