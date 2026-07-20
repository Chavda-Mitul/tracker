import { NavDrawer } from "@/components/common/nav-drawer"
import { HeaderTimer } from "@/components/common/header-timer"
import { TimerProvider } from "@/context/timer-context"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <TimerProvider>
      <div className="flex flex-1 flex-col bg-background font-sans">
        <header className="flex items-center gap-3 border-b-[2.5px] border-ink bg-paper p-4 shadow-[0_3px_0_0_var(--color-ink)]">
          <NavDrawer />
          <h1 className="sketch-title text-xl font-bold tracking-wide">
            Solo Leveling
          </h1>
          <HeaderTimer />
        </header>
        {children}
      </div>
    </TimerProvider>
  )
}
