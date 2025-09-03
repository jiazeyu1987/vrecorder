import { type NextRequest, NextResponse } from "next/server"

// Mock database - in production, replace with actual database queries
const patients = [
  {
    id: 1,
    familyId: 1,
    name: "李老太",
    gender: "女",
    birthDate: "1945-03-15",
    relationship: "户主",
    medicalConditions: "高血压,糖尿病",
    allergies: "青霉素过敏",
    phone: "13800138010",
    status: "active",
  },
  {
    id: 2,
    familyId: 1,
    name: "李大爷",
    gender: "男",
    birthDate: "1943-07-22",
    relationship: "配偶",
    medicalConditions: "冠心病",
    allergies: "无",
    phone: "13800138011",
    status: "active",
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const familyId = searchParams.get("familyId")

  let filteredPatients = patients
  if (familyId) {
    filteredPatients = patients.filter((p) => p.familyId === Number.parseInt(familyId))
  }

  return NextResponse.json({ patients: filteredPatients })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const newPatient = {
    id: patients.length + 1,
    ...body,
    status: "active",
  }
  patients.push(newPatient)

  return NextResponse.json({ patient: newPatient }, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { id, ...updateData } = body

  const patientIndex = patients.findIndex((p) => p.id === id)
  if (patientIndex === -1) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 })
  }

  patients[patientIndex] = { ...patients[patientIndex], ...updateData }
  return NextResponse.json({ patient: patients[patientIndex] })
}
