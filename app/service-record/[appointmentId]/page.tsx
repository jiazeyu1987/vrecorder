"use client"

import { useParams } from "next/navigation"
import { BottomNavigation } from "@/components/bottom-navigation"
import { ServiceRecordManager } from "@/components/service-record-manager"
import { ProtectedRoute } from "@/components/protected-route"

export default function ServiceRecordPage() {
  const params = useParams()
  const appointmentId = params.appointmentId as string

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-white to-blue-50/30">
        <main className="pb-20">
          <ServiceRecordManager appointmentId={appointmentId} />
        </main>
        <BottomNavigation activeTab="schedule" />
      </div>
    </ProtectedRoute>
  )
}
