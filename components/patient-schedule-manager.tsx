"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useIsMobile } from "@/hooks/use-mobile"
import { PatientRecordDetail } from "@/components/patient-record-detail"
import { PatientOperations } from "@/components/patient-operations"
import { Calendar, Clock, FileText, CreditCard, Phone, Heart, Edit, Plus, ChevronRight, User } from "lucide-react"

interface Patient {
  id: string
  name: string
  age: number
  gender: string
  conditions: string[]
  lastService: string
  nextAppointment?: string
  paymentStatus: "normal" | "overdue" | "suspended"
  phone: string
  address: string
  familyId: string
  relationship: string
  medications?: string[]
}

interface HealthRecord {
  id: string
  patientId: string
  patientName: string
  date: string
  time: string
  serviceType: string
  location: string
  vitals: {
    bloodPressure?: string
    heartRate?: number
    temperature?: number
    bloodSugar?: number
  }
  observations: string
  photos: string[]
  audioNotes: string[]
  recommendations: string
  status: "draft" | "completed" | "reviewed"
}

interface Appointment {
  id: string
  patientId: string
  date: string
  time: string
  serviceType: string
  status: "scheduled" | "in-progress" | "completed" | "cancelled"
  notes?: string
}

const mockPatients: Patient[] = [
  {
    id: "1",
    name: "张明",
    age: 65,
    gender: "男",
    conditions: ["高血压"],
    lastService: "2024-03-10",
    nextAppointment: "2024-03-22",
    paymentStatus: "normal",
    phone: "138****1234",
    address: "朝阳区幸福小区3号楼502",
    familyId: "1",
    relationship: "户主",
    medications: ["降压药"],
  },
  {
    id: "2",
    name: "李梅",
    age: 62,
    gender: "女",
    conditions: ["糖尿病"],
    lastService: "2024-03-12",
    nextAppointment: "2024-03-20",
    paymentStatus: "normal",
    phone: "138****1234",
    address: "朝阳区幸福小区3号楼502",
    familyId: "1",
    relationship: "配偶",
    medications: ["胰岛素"],
  },
  {
    id: "3",
    name: "王小明",
    age: 35,
    gender: "男",
    conditions: ["健康体检"],
    lastService: "2024-03-05",
    paymentStatus: "overdue",
    phone: "139****5678",
    address: "朝阳区阳光花园1号楼301",
    familyId: "2",
    relationship: "户主",
  },
]

const mockRecords: HealthRecord[] = [
  {
    id: "1",
    patientId: "1",
    patientName: "张明",
    date: "2024-03-10",
    time: "09:30",
    serviceType: "基础健康监测",
    location: "朝阳区幸福小区3号楼502",
    vitals: {
      bloodPressure: "145/92",
      heartRate: 78,
      temperature: 36.5,
    },
    observations: "患者精神状态良好，血压略高于正常值",
    photos: [],
    audioNotes: [],
    recommendations: "建议减少盐分摄入，增加运动量",
    status: "completed",
  },
  {
    id: "2",
    patientId: "2",
    patientName: "李梅",
    date: "2024-03-12",
    time: "14:00",
    serviceType: "糖尿病管理",
    location: "朝阳区幸福小区3号楼502",
    vitals: {
      bloodSugar: 8.5,
      bloodPressure: "130/85",
    },
    observations: "血糖控制不佳，需要调整胰岛素剂量",
    photos: [],
    audioNotes: [],
    recommendations: "联系医生调整胰岛素用量",
    status: "completed",
  },
]

export function PatientScheduleManager() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [activeTab, setActiveTab] = useState("health-records")
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null)
  const [showOperations, setShowOperations] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const isMobile = useIsMobile()

  const getPatientRecords = (patientId: string) => {
    return mockRecords.filter((record) => record.patientId === patientId)
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "bg-green-100 text-green-700 border-green-200"
      case "overdue":
        return "bg-orange-100 text-orange-700 border-orange-200"
      case "suspended":
        return "bg-gray-100 text-gray-700 border-gray-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const handleSaveRecord = (record: HealthRecord) => {
    console.log("[v0] Saving record:", record)
    setSelectedRecord(null)
  }

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient)
    setShowEditModal(true)
  }

  const handleSavePatient = () => {
    console.log("[v0] Saving patient:", editingPatient)
    setShowEditModal(false)
    setEditingPatient(null)
  }

  if (showOperations && selectedPatient) {
    return <PatientOperations patient={selectedPatient} onClose={() => setShowOperations(false)} />
  }

  if (selectedRecord) {
    return (
      <PatientRecordDetail record={selectedRecord} onSave={handleSaveRecord} onClose={() => setSelectedRecord(null)} />
    )
  }

  if (selectedPatient) {
    const patientRecords = getPatientRecords(selectedPatient.id)

    return (
      <div className={`space-y-4 ${isMobile ? "px-4 py-4" : "px-6 py-6"}`}>
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedPatient(null)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            ←
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-800">{selectedPatient.name}</h1>
            <p className="text-sm text-gray-600">
              {selectedPatient.age}岁 | {selectedPatient.gender}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditPatient(selectedPatient)}
            className="bg-transparent"
          >
            <Edit className="h-4 w-4 mr-2" />
            编辑
          </Button>
        </div>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="font-medium">健康状况:</span>
                </div>
                <div className="ml-6 text-gray-600">{selectedPatient.conditions.join(", ")}</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getPaymentStatusColor(selectedPatient.paymentStatus)}>
                    {selectedPatient.paymentStatus === "normal"
                      ? "正常"
                      : selectedPatient.paymentStatus === "overdue"
                        ? "欠费"
                        : "暂停"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="health-records">健康记录</TabsTrigger>
            <TabsTrigger value="appointments">预约</TabsTrigger>
            <TabsTrigger value="operations">操作</TabsTrigger>
          </TabsList>

          <TabsContent value="health-records" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">健康记录</h3>
              <Button size="sm" className="bg-primary">
                <Plus className="h-4 w-4 mr-2" />
                新建记录
              </Button>
            </div>

            {patientRecords.length === 0 ? (
              <Card className="p-6 text-center text-gray-500">
                <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>暂无健康记录</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {patientRecords.map((record) => (
                  <Card
                    key={record.id}
                    className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedRecord(record)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{record.serviceType}</h4>
                          <p className="text-sm text-gray-600">
                            {record.date} {record.time}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            record.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : record.status === "draft"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-blue-100 text-blue-700"
                          }
                        >
                          {record.status === "completed" ? "已完成" : record.status === "draft" ? "草稿" : "已审核"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{record.observations}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-4 text-xs text-gray-500">
                          {record.vitals.bloodPressure && <span>血压: {record.vitals.bloodPressure}</span>}
                          {record.vitals.heartRate && <span>心率: {record.vitals.heartRate}</span>}
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">预约管理</h3>
              <Button size="sm" className="bg-primary">
                <Plus className="h-4 w-4 mr-2" />
                新建预约
              </Button>
            </div>

            <Card className="p-6 text-center text-gray-500">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>暂无预约信息</p>
            </Card>
          </TabsContent>

          <TabsContent value="operations" className="space-y-4">
            <h3 className="text-lg font-medium">患者操作</h3>

            <div className="grid gap-3">
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => setShowOperations(true)}
              >
                <Calendar className="h-4 w-4 mr-3" />
                安排服务预约
              </Button>

              <Button variant="outline" className="w-full justify-start bg-transparent">
                <CreditCard className="h-4 w-4 mr-3" />
                查看付款记录
              </Button>

              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Phone className="h-4 w-4 mr-3" />
                联系患者
              </Button>

              <Button variant="outline" className="w-full justify-start bg-transparent">
                <FileText className="h-4 w-4 mr-3" />
                生成健康报告
              </Button>

              {selectedPatient.paymentStatus === "overdue" && (
                <Button
                  variant="outline"
                  className="w-full justify-start text-orange-600 border-orange-300 bg-transparent"
                >
                  <CreditCard className="h-4 w-4 mr-3" />
                  催缴费用
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>编辑患者信息</DialogTitle>
            </DialogHeader>

            {editingPatient && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="name">姓名</Label>
                    <Input
                      id="name"
                      value={editingPatient.name}
                      onChange={(e) => setEditingPatient((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">年龄</Label>
                    <Input
                      id="age"
                      type="number"
                      value={editingPatient.age}
                      onChange={(e) =>
                        setEditingPatient((prev) => (prev ? { ...prev, age: Number.parseInt(e.target.value) } : null))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">联系电话</Label>
                  <Input
                    id="phone"
                    value={editingPatient.phone}
                    onChange={(e) => setEditingPatient((prev) => (prev ? { ...prev, phone: e.target.value } : null))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">地址</Label>
                  <Textarea
                    id="address"
                    value={editingPatient.address}
                    onChange={(e) => setEditingPatient((prev) => (prev ? { ...prev, address: e.target.value } : null))}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="conditions">健康状况</Label>
                  <Input
                    id="conditions"
                    value={editingPatient.conditions.join(", ")}
                    onChange={(e) =>
                      setEditingPatient((prev) => (prev ? { ...prev, conditions: e.target.value.split(", ") } : null))
                    }
                    placeholder="用逗号分隔多个状况"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowEditModal(false)}>
                    取消
                  </Button>
                  <Button className="flex-1" onClick={handleSavePatient}>
                    保存
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${isMobile ? "px-4 py-4" : "px-6 py-6"}`}>
      <div className="text-center py-2">
        <h1 className="text-2xl font-semibold text-gray-800">患者日程</h1>
        <p className="text-sm text-gray-600 mt-1">选择患者查看记录和操作</p>
      </div>

      <div className="grid gap-3">
        {mockPatients.map((patient) => (
          <Card
            key={patient.id}
            className="shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
            onClick={() => setSelectedPatient(patient)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <span className="font-medium">{patient.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {patient.age}岁
                  </Badge>
                </div>
                <Badge variant="outline" className={getPaymentStatusColor(patient.paymentStatus)}>
                  {patient.paymentStatus === "normal" ? "正常" : patient.paymentStatus === "overdue" ? "欠费" : "暂停"}
                </Badge>
              </div>

              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Heart className="h-3 w-3" />
                  <span>{patient.conditions.join(", ")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>最近服务: {patient.lastService}</span>
                </div>
                {patient.nextAppointment && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>下次预约: {patient.nextAppointment}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-3">
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
