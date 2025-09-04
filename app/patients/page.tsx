import { BottomNavigation } from "@/components/bottom-navigation"
import { PatientList } from "@/components/patient-list"
import { ProtectedRoute } from "@/components/protected-route"

export default function PatientsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50/30">
        <main className="pb-24 px-0">
          <PatientList />
        </main>
        <BottomNavigation activeTab="patients" />
      </div>
    </ProtectedRoute>
  )
}
