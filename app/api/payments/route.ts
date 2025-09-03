import { type NextRequest, NextResponse } from "next/server"

const payments = [
  {
    id: 1,
    appointmentId: 1,
    patientName: "李老太",
    amount: 80.0,
    paymentMethod: "wechat",
    status: "completed",
    transactionId: "WX20241201001",
    paymentDate: new Date().toISOString(),
    serviceType: "基础护理",
  },
  {
    id: 2,
    appointmentId: 2,
    patientName: "李老太",
    amount: 50.0,
    paymentMethod: "",
    status: "pending",
    transactionId: "",
    paymentDate: null,
    serviceType: "血压测量",
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")

  let filteredPayments = payments
  if (status) {
    filteredPayments = payments.filter((p) => p.status === status)
  }

  return NextResponse.json({ payments: filteredPayments })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { appointmentId, paymentMethod, amount } = body

  // Process payment logic here
  const newPayment = {
    id: payments.length + 1,
    appointmentId,
    amount,
    paymentMethod,
    status: "completed",
    transactionId: `${paymentMethod.toUpperCase()}${Date.now()}`,
    paymentDate: new Date().toISOString(),
  }

  payments.push(newPayment)

  // Update appointment payment status
  return NextResponse.json({ payment: newPayment }, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { id, action, ...updateData } = body

  const paymentIndex = payments.findIndex((p) => p.id === id)
  if (paymentIndex === -1) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 })
  }

  if (action === "refund") {
    payments[paymentIndex] = {
      ...payments[paymentIndex],
      status: "refunded",
      refundDate: new Date().toISOString(),
      refundReason: updateData.reason,
    }
  } else {
    payments[paymentIndex] = { ...payments[paymentIndex], ...updateData }
  }

  return NextResponse.json({ payment: payments[paymentIndex] })
}
