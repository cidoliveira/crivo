import { Sidebar } from "@/components/sidebar"
import { WarmupOverlay } from "@/components/warmup-overlay"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex h-dvh relative z-[1]"
      style={{
        background: `
          radial-gradient(ellipse 60% 45% at 10% 0%, rgba(45,212,160,0.02) 0%, transparent 55%),
          radial-gradient(ellipse 40% 35% at 90% 100%, rgba(45,212,160,0.012) 0%, transparent 45%)
        `,
      }}
    >
      <WarmupOverlay />
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
