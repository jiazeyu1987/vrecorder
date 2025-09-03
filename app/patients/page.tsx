import { BottomNavigation } from "@/components/bottom-navigation"
import { PatientList } from "@/components/patient-list"

export default function PatientsPage() {
  return (
    <div className="min-h-screen bg-gray-50/30">
      <main className="pb-24 px-0">
        <PatientList />
      </main>
      <BottomNavigation activeTab="patients" />
    </div>
  )
}
