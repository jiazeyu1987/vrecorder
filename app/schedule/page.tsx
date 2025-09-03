import { BottomNavigation } from "@/components/bottom-navigation"
import { ScheduleManager } from "@/components/schedule-manager"

export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-gray-50/30">
      <main className="pb-24 px-0">
        <ScheduleManager />
      </main>
      <BottomNavigation activeTab="schedule" />
    </div>
  )
}
