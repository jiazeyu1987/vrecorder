import { BottomNavigation } from "@/components/bottom-navigation"
import { HealthRecords } from "@/components/health-records"

export default function RecordsPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-20">
        <HealthRecords />
      </main>
      <BottomNavigation activeTab="records" />
    </div>
  )
}
