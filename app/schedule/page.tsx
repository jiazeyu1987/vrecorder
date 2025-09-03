import { BottomNavigation } from "@/components/bottom-navigation"
import { ScheduleManager } from "@/components/schedule-manager"

export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-20">
        <ScheduleManager />
      </main>
      <BottomNavigation activeTab="schedule" />
    </div>
  )
}
