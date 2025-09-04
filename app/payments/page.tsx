import { BottomNavigation } from "@/components/bottom-navigation"
import { PaymentManager } from "@/components/payment-manager"
import { ProtectedRoute } from "@/components/protected-route"

export default function PaymentsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <main className="pb-20">
          <PaymentManager />
        </main>
        <BottomNavigation />
      </div>
    </ProtectedRoute>
  )
}
