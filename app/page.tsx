import { BottomNavigation } from "@/components/bottom-navigation"
import ScheduleManager from "@/components/schedule-manager"
import { ProtectedRoute } from "@/components/protected-route"

export default function HomePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50/30">
        <main className="pb-24 px-0">
          <ScheduleManager />
        </main>
        <BottomNavigation activeTab="schedule" />
      </div>
    </ProtectedRoute>
  )
}
