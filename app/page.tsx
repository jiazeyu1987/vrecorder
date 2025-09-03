import { BottomNavigation } from "@/components/bottom-navigation"
import { Dashboard } from "@/components/dashboard"
import { ProtectedRoute } from "@/components/protected-route"

export default function HomePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-white to-blue-50/30">
        <main className="pb-20">
          <Dashboard />
        </main>
        <BottomNavigation activeTab="home" />
      </div>
    </ProtectedRoute>
  )
}
