import { BottomNavigation } from "@/components/bottom-navigation"
import { HealthRecords } from "@/components/health-records"

export default function RecordsPage() {
  return (
    <div className="min-h-screen bg-gray-50/30">
      <main className="pb-24 px-0">
        <HealthRecords />
      </main>
      <BottomNavigation activeTab="records" />
    </div>
  )
}
