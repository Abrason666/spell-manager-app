/**
 * Sincronizza il database Supabase con gli spell dall'SRD 5.2 2024
 * Fonte: https://5e24srd.com/spells/spell-descriptions.html
 * Licenza contenuto: Creative Commons CC-BY 4.0 (WotC SRD 5.2)
 *
 * Uso: npm run sync:spells
 *
 * Lo script è idempotente: può essere rieseguito ogni volta che il sito
 * si aggiorna — fa upsert per slug, quindi aggiorna i record esistenti
 * e inserisce i nuovi.
 */

import { config } from 'dotenv'
config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

// ── Supabase ──────────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
)

// ── Tipi ──────────────────────────────────────────────────────────────────────
interface SpellRecord {
  slug: string
  name: string
  level: number
  school: string
  classes: string[]
  casting_time: string
  range: string
  components: string
  duration: string
  concentration: boolean
  ritual: boolean
  description: string
  higher_levels: string | null
  source: string
}

// ── Helpers HTML ──────────────────────────────────────────────────────────────
function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s{2,}/g, ' ')
    .trim()
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

// ── Parser spell ──────────────────────────────────────────────────────────────
function parseSpells(html: string): SpellRecord[] {
  const spells: SpellRecord[] = []

  // Dividi per heading h3 — ogni spell inizia con <h3
  const blocks = html.split(/<h3[^>]*>/)
  blocks.shift() // rimuovi il blocco prima del primo spell

  for (const block of blocks) {
    try {
      // Nome spell: tutto prima del </h3>
      const nameMatch = block.match(/^([^<]+)<\/h3>/)
      if (!nameMatch) continue
      let name = stripTags(nameMatch[1]).trim()
      if (!name) continue

      // Metadato: <em>Level X School (Classes)</em> o <em>School Cantrip (Classes)</em>
      const emMatch = block.match(/<em>([^<]+)<\/em>/)
      if (!emMatch) continue
      const meta = stripTags(emMatch[1]).trim()

      let level = 0
      let school = ''
      let classes: string[] = []

      const leveledMatch = meta.match(/^Level (\d+)\s+(\w+)\s+\(([^)]+)\)/)
      const cantripMatch = meta.match(/^(\w+)\s+Cantrip\s+\(([^)]+)\)/)

      if (leveledMatch) {
        level = parseInt(leveledMatch[1])
        school = leveledMatch[2]
        classes = leveledMatch[3].split(',').map(c => c.trim().toLowerCase())
      } else if (cantripMatch) {
        level = 0
        school = cantripMatch[1]
        classes = cantripMatch[2].split(',').map(c => c.trim().toLowerCase())
      } else {
        // Caso: nome troncato nell'h3 (es. "Mass Healing" + "Word Level 3 Abjuration (Bard, Cleric)")
        const overflowMatch = meta.match(/^(\S+)\s+Level (\d+)\s+(\w+)\s+\(([^)]+)\)/) ??
                              meta.match(/^(\S+)\s+(\w+)\s+Cantrip\s+\(([^)]+)\)/)
        if (overflowMatch && overflowMatch.length >= 4) {
          const extraWord = overflowMatch[1]
          const restMeta = meta.slice(extraWord.length).trim()
          const lm2 = restMeta.match(/^Level (\d+)\s+(\w+)\s+\(([^)]+)\)/)
          const cm2 = restMeta.match(/^(\w+)\s+Cantrip\s+\(([^)]+)\)/)
          if (lm2) {
            name = `${name} ${extraWord}`  // riassembla nome completo
            level = parseInt(lm2[1])
            school = lm2[2]
            classes = lm2[3].split(',').map(c => c.trim().toLowerCase())
          } else if (cm2) {
            name = `${name} ${extraWord}`
            level = 0
            school = cm2[1]
            classes = cm2[2].split(',').map(c => c.trim().toLowerCase())
          } else {
            console.warn(`⚠ Metadato non parsato per "${name}": ${meta}`)
            continue
          }
        } else {
          console.warn(`⚠ Metadato non parsato per "${name}": ${meta}`)
          continue
        }
      }

      // Proprietà dalla lista <ul>
      const props: Record<string, string> = {}
      const liMatches = block.matchAll(/<li[^>]*>(.*?)<\/li>/gs)
      for (const m of liMatches) {
        const text = stripTags(m[1])
        const propMatch = text.match(/^(\w[\w\s]+?):\s+(.+)$/)
        if (propMatch) {
          props[propMatch[1].trim()] = propMatch[2].trim()
        }
      }

      const casting_time = props['Casting Time'] ?? ''
      const range       = props['Range'] ?? ''
      const components  = props['Components'] ?? ''
      const duration    = props['Duration'] ?? ''

      const concentration = duration.toLowerCase().startsWith('concentration')
      const ritual        = casting_time.toLowerCase().includes('ritual')

      // Descrizione: tutti i <p> dopo il </ul>
      const afterUl = block.split(/<\/ul>/)[1] ?? ''
      const paragraphs: string[] = []
      let higher_levels: string | null = null

      const pMatches = afterUl.matchAll(/<p[^>]*>(.*?)<\/p>/gs)
      for (const m of pMatches) {
        const text = stripTags(m[1]).trim()
        if (!text) continue

        if (text.match(/^Using a Higher.Level Spell Slot\./i)) {
          higher_levels = text.replace(/^Using a Higher.Level Spell Slot\.\s*/i, '').trim()
        } else if (text.match(/^Cantrip Upgrade\./i)) {
          // Aggiungi alla descrizione principale
          paragraphs.push(text)
        } else {
          paragraphs.push(text)
        }
      }

      // Righe di tabella (se presenti) — aggiunte alla descrizione
      const tableRows = afterUl.matchAll(/<tr[^>]*>(.*?)<\/tr>/gs)
      const tableLines: string[] = []
      for (const row of tableRows) {
        const cells = [...row[1].matchAll(/<t[dh][^>]*>(.*?)<\/t[dh]>/gs)]
          .map(c => stripTags(c[1]).trim())
          .filter(Boolean)
        if (cells.length) tableLines.push(cells.join(' | '))
      }
      if (tableLines.length) paragraphs.push(tableLines.join('\n'))

      const description = paragraphs.join('\n\n').trim()

      spells.push({
        slug: toSlug(name),
        name,
        level,
        school,
        classes,
        casting_time,
        range,
        components,
        duration,
        concentration,
        ritual,
        description,
        higher_levels,
        source: 'SRD 5.2 2024 CC-BY 4.0',
      })
    } catch (err) {
      console.error(`Errore nel parsare un blocco:`, err)
    }
  }

  return spells
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('📥 Scarico la pagina da 5e24srd.com...')

  const res = await fetch('https://5e24srd.com/spells/spell-descriptions.html')
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  const html = await res.text()

  console.log(`✓ Pagina scaricata (${Math.round(html.length / 1024)} KB)`)

  const spells = parseSpells(html)
  console.log(`\n📖 Spell parsati: ${spells.length}`)

  if (spells.length === 0) {
    console.error('Nessuno spell trovato. Controlla la struttura della pagina.')
    process.exit(1)
  }

  // Statistiche scuole e classi
  const schools = new Set(spells.map(s => s.school))
  const allClasses = new Set(spells.flatMap(s => s.classes))
  console.log(`   Scuole trovate: ${[...schools].sort().join(', ')}`)
  console.log(`   Classi trovate: ${[...allClasses].sort().join(', ')}`)
  console.log(`   Con concentrazione: ${spells.filter(s => s.concentration).length}`)
  console.log(`   Rituali: ${spells.filter(s => s.ritual).length}`)
  console.log(`   Senza descrizione: ${spells.filter(s => !s.description).length}`)

  console.log('\n⬆️  Upsert su Supabase...')

  let ok = 0, failed = 0

  // Batch da 50 per evitare limiti
  const BATCH = 50
  for (let i = 0; i < spells.length; i += BATCH) {
    const batch = spells.slice(i, i + BATCH)
    const { error } = await supabase
      .from('spells')
      .upsert(batch, { onConflict: 'slug' })

    if (error) {
      console.error(`Errore batch ${i}-${i + BATCH}:`, error.message)
      failed += batch.length
    } else {
      ok += batch.length
      process.stdout.write(`\r   ${ok}/${spells.length} spell salvati...`)
    }
  }

  console.log(`\n\n✅ Completato: ${ok} salvati, ${failed} falliti.`)
  console.log('   Fonte: SRD 5.2 2024 CC-BY 4.0 — https://5e24srd.com')
}

main().catch(err => {
  console.error('Errore fatale:', err)
  process.exit(1)
})
