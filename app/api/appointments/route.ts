import { type NextRequest, NextResponse } from "next/server"

const appointments = [
  {
    id: 1,
    patientId: 1,
    patientName: "李老太",
    serviceType: "基础护理",
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "10:00",
    status: "scheduled",
    paymentStatus: "paid",
    amount: 80.0,
    address: "北京市朝阳区建国路88号",
  },
  {
    id: 2,
    patientId: 1,
    patientName: "李老太",
    serviceType: "血压测量",
    date: new Date().toISOString().split("T")[0],
    startTime: "10:30",
    endTime: "11:00",
    status: "scheduled",
    paymentStatus: "pending",
    amount: 50.0,
    address: "北京市朝阳区建国路88号",
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get("date")
  const status = searchParams.get("status")

  let filteredAppointments = appointments
  if (date) {
    filteredAppointments = filteredAppointments.filter((a) => a.date === date)
  }
  if (status) {
    filteredAppointments = filteredAppointments.filter((a) => a.status === status)
  }

  return NextResponse.json({ appointments: filteredAppointments })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const newAppointment = {
    id: appointments.length + 1,
    ...body,
    status: "scheduled",
  }
  appointments.push(newAppointment)

  return NextResponse.json({ appointment: newAppointment }, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { id, ...updateData } = body

  const appointmentIndex = appointments.findIndex((a) => a.id === id)
  if (appointmentIndex === -1) {
    return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
  }

  appointments[appointmentIndex] = { ...appointments[appointmentIndex], ...updateData }
  return NextResponse.json({ appointment: appointments[appointmentIndex] })
}
