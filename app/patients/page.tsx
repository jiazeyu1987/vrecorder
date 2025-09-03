import { BottomNavigation } from "@/components/bottom-navigation"
import { PatientList } from "@/components/patient-list"

export default function PatientsPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-20">
        <PatientList />
      </main>
      <BottomNavigation activeTab="patients" />
    </div>
  )
}
