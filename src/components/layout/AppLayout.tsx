import { Header } from './Header'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-4 py-4 pb-24 lg:pb-6 max-w-[1600px] mx-auto">
        {children}
      </main>
    </div>
  )
}
