import { BottomNavigation } from "@/components/bottom-navigation"
import { PaymentManager } from "@/components/payment-manager"

export default function PaymentsPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-20">
        <PaymentManager />
      </main>
      <BottomNavigation />
    </div>
  )
}
