import { type NextRequest, NextResponse } from "next/server"

const healthRecords = [
  {
    id: 1,
    appointmentId: 1,
    patientId: 1,
    patientName: "李老太",
    serviceDate: new Date().toISOString().split("T")[0],
    vitalSigns: {
      bloodPressure: "130/85",
      heartRate: 78,
      temperature: 36.8,
      bloodSugar: 6.2,
    },
    symptoms: "无明显不适",
    observations: "患者精神状态良好，血糖控制稳定",
    treatments: "协助用药，健康指导",
    photos: [],
    audioRecordings: [],
    followUpRequired: false,
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const patientId = searchParams.get("patientId")
  const date = searchParams.get("date")

  let filteredRecords = healthRecords
  if (patientId) {
    filteredRecords = filteredRecords.filter((r) => r.patientId === Number.parseInt(patientId))
  }
  if (date) {
    filteredRecords = filteredRecords.filter((r) => r.serviceDate === date)
  }

  return NextResponse.json({ records: filteredRecords })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const newRecord = {
    id: healthRecords.length + 1,
    ...body,
    serviceDate: new Date().toISOString().split("T")[0],
  }
  healthRecords.push(newRecord)

  return NextResponse.json({ record: newRecord }, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { id, ...updateData } = body

  const recordIndex = healthRecords.findIndex((r) => r.id === id)
  if (recordIndex === -1) {
    return NextResponse.json({ error: "Health record not found" }, { status: 404 })
  }

  healthRecords[recordIndex] = { ...healthRecords[recordIndex], ...updateData }
  return NextResponse.json({ record: healthRecords[recordIndex] })
}
