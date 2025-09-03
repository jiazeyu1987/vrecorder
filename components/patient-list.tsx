"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Users,
  MapPin,
  Calendar,
  CreditCard,
  Phone,
  User,
  Heart,
  Pill,
  ChevronRight,
  Plus,
  FileText,
  Activity,
  Thermometer,
  Droplets,
  Weight,
  Stethoscope,
  Eye,
  Camera,
  Mic,
  Edit,
  X,
  Trash2,
} from "lucide-react"

interface HealthRecord {
  id: string
  date: string
  time: string
  serviceType: string
  location: string
  vitals: {
    bloodPressure?: string
    heartRate?: number
    temperature?: number
    bloodSugar?: number
    weight?: number
    height?: number
  }
  observations: string
  photos: string[]
  audioNotes: string[]
  recommendations: string
  nextVisit?: string
  status: "draft" | "completed" | "reviewed"
}

interface FamilyMember {
  id: string
  name: string
  age: number
  gender: string
  relationship: string
  conditions: string[]
  lastService: string
  packageType: string
  paymentStatus: "normal" | "overdue" | "suspended"
  medications?: string[]
  records?: HealthRecord[]
}

interface Family {
  id: string
  householdHead: string
  address: string
  phone: string
  members: FamilyMember[]
  totalMembers: number
  lastService: string
}

const mockHealthRecords: HealthRecord[] = [
  {
    id: "1",
    date: "2024-03-15",
    time: "09:30",
    serviceType: "基础健康监测",
    location: "朝阳区XX路XX号",
    vitals: {
      bloodPressure: "145/92",
      heartRate: 78,
      temperature: 36.5,
      weight: 72,
    },
    observations: "患者精神状态良好，血压略高于正常值，建议调整用药。",
    photos: ["血压测量.jpg", "用药记录.jpg"],
    audioNotes: ["患者主诉.mp3"],
    recommendations: "建议减少盐分摄入，增加运动量，下周复查血压。",
    nextVisit: "2024-03-22",
    status: "completed",
  },
  {
    id: "2",
    date: "2024-03-12",
    time: "14:00",
    serviceType: "综合健康评估",
    location: "朝阳区YY路YY号",
    vitals: {
      bloodPressure: "130/85",
      heartRate: 82,
      temperature: 36.8,
      bloodSugar: 8.5,
      weight: 58,
    },
    observations: "血糖控制不佳，需要调整胰岛素剂量。",
    photos: ["血糖测试.jpg"],
    audioNotes: [],
    recommendations: "联系医生调整胰岛素用量，加强血糖监测。",
    status: "completed",
  },
]

const mockFamilies: Family[] = [
  {
    id: "1",
    householdHead: "张伟",
    address: "朝阳区幸福小区3号楼502",
    phone: "138****1234",
    members: [
      {
        id: "1-1",
        name: "张伟",
        age: 65,
        gender: "男",
        relationship: "户主",
        conditions: ["高血压"],
        lastService: "2024-03-10",
        packageType: "标准套餐",
        paymentStatus: "normal",
        medications: ["降压药"],
        records: [mockHealthRecords[0]],
      },
      {
        id: "1-2",
        name: "李梅",
        age: 62,
        gender: "女",
        relationship: "配偶",
        conditions: ["糖尿病"],
        lastService: "2024-03-12",
        packageType: "VIP套餐",
        paymentStatus: "normal",
        medications: ["胰岛素"],
        records: [mockHealthRecords[1]],
      },
    ],
    totalMembers: 2,
    lastService: "2024-03-12",
  },
  {
    id: "2",
    householdHead: "王小明",
    address: "朝阳区阳光花园1号楼301",
    phone: "139****5678",
    members: [
      {
        id: "2-1",
        name: "王小明",
        age: 35,
        gender: "男",
        relationship: "户主",
        conditions: ["健康体检"],
        lastService: "2024-03-05",
        packageType: "基础套餐",
        paymentStatus: "overdue",
      },
    ],
    totalMembers: 1,
    lastService: "2024-03-05",
  },
  {
    id: "3",
    householdHead: "陈奶奶",
    address: "海淀区康乐小区5号楼201",
    phone: "136****9012",
    members: [
      {
        id: "3-1",
        name: "陈秀英",
        age: 78,
        gender: "女",
        relationship: "户主",
        conditions: ["高血压", "糖尿病"],
        lastService: "2024-03-14",
        packageType: "VIP套餐",
        paymentStatus: "normal",
        medications: ["降压药", "降糖药"],
      },
    ],
    totalMembers: 1,
    lastService: "2024-03-14",
  },
]

export function PatientList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null)
  const [selectedPatient, setSelectedPatient] = useState<FamilyMember | null>(null)
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null)
  const [showNewFamilyModal, setShowNewFamilyModal] = useState(false)
  const [showNewRecordModal, setShowNewRecordModal] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [editingPatient, setEditingPatient] = useState(false)
  const isMobile = useIsMobile()
  const [newFamily, setNewFamily] = useState({
    householdHead: "",
    address: "",
    phone: "",
    members: [
      {
        name: "",
        age: "",
        gender: "",
        relationship: "户主",
        conditions: "",
        packageType: "基础套餐",
      },
    ],
  })
  const [editedPatientData, setEditedPatientData] = useState<Partial<FamilyMember>>({})
  const [newRecord, setNewRecord] = useState<Partial<HealthRecord>>({
    serviceType: "",
    location: "",
    vitals: {},
    observations: "",
    recommendations: "",
    photos: [],
    audioNotes: [],
    status: "draft",
  })

  const addFamilyMember = () => {
    setNewFamily((prev) => ({
      ...prev,
      members: [
        ...prev.members,
        {
          name: "",
          age: "",
          gender: "",
          relationship: "",
          conditions: "",
          packageType: "基础套餐",
        },
      ],
    }))
  }

  const removeFamilyMember = (index: number) => {
    if (newFamily.members.length > 1) {
      setNewFamily((prev) => ({
        ...prev,
        members: prev.members.filter((_, i) => i !== index),
      }))
    }
  }

  const updateFamilyMember = (index: number, field: string, value: string) => {
    setNewFamily((prev) => ({
      ...prev,
      members: prev.members.map((member, i) => (i === index ? { ...member, [field]: value } : member)),
    }))
  }

  const handleSubmitNewFamily = () => {
    console.log("[v0] Submitting new family:", newFamily)
    setShowNewFamilyModal(false)
    setNewFamily({
      householdHead: "",
      address: "",
      phone: "",
      members: [
        {
          name: "",
          age: "",
          gender: "",
          relationship: "户主",
          conditions: "",
          packageType: "基础套餐",
        },
      ],
    })
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

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case "normal":
        return "正常"
      case "overdue":
        return "欠费"
      case "suspended":
        return "暂停"
      default:
        return "未知"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-200"
      case "draft":
        return "bg-orange-100 text-orange-700 border-orange-200"
      case "reviewed":
        return "bg-blue-100 text-blue-700 border-blue-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "已完成"
      case "draft":
        return "草稿"
      case "reviewed":
        return "已审核"
      default:
        return "未知"
    }
  }

  const handleEditPatient = () => {
    if (editingPatient && selectedPatient) {
      // Save changes
      console.log("[v0] Saving patient changes:", editedPatientData)
      // Here you would typically update the patient data in your backend
      setEditingPatient(false)
      setEditedPatientData({})
    } else {
      // Start editing
      setEditingPatient(true)
      if (selectedPatient) {
        setEditedPatientData({
          name: selectedPatient.name,
          age: selectedPatient.age,
          gender: selectedPatient.gender,
          packageType: selectedPatient.packageType,
          conditions: selectedPatient.conditions,
          medications: selectedPatient.medications || [],
        })
      }
    }
  }

  const updateEditedPatientData = (field: string, value: any) => {
    setEditedPatientData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const cancelEditing = () => {
    setEditingPatient(false)
    setEditedPatientData({})
  }

  const startRecording = () => {
    setIsRecording(true)
    setRecordingTime(0)
    // Start recording logic here
  }

  const stopRecording = () => {
    setIsRecording(false)
    // Stop recording and save audio file
  }

  const handleSubmitNewRecord = () => {
    if (selectedPatient) {
      const recordWithPatientInfo = {
        ...newRecord,
        id: Date.now().toString(),
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
        patientName: selectedPatient.name,
        patientAge: selectedPatient.age,
      }
      console.log("[v0] Submitting new record for patient:", recordWithPatientInfo)
      setShowNewRecordModal(false)
      setNewRecord({
        serviceType: "",
        location: "",
        vitals: {},
        observations: "",
        recommendations: "",
        photos: [],
        audioNotes: [],
        status: "draft",
      })
    }
  }

  const updateVital = (key: string, value: string) => {
    setNewRecord((prev) => ({
      ...prev,
      vitals: {
        ...prev.vitals,
        [key]: value,
      },
    }))
  }

  if (selectedRecord) {
    return (
      <div className={`space-y-4 ${isMobile ? "px-4 py-4" : "px-6 py-6 max-w-2xl mx-auto"}`}>
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedRecord(null)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            ←
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">服务记录</h1>
            <p className="text-sm text-gray-600">{selectedPatient?.name}</p>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                基本信息
              </div>
              <Badge variant="outline" className={getStatusColor(selectedRecord.status)}>
                {getStatusText(selectedRecord.status)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">服务日期</span>
                <p className="font-medium">{selectedRecord.date}</p>
              </div>
              <div>
                <span className="text-muted-foreground">服务时间</span>
                <p className="font-medium">{selectedRecord.time}</p>
              </div>
              <div>
                <span className="text-muted-foreground">服务类型</span>
                <p className="font-medium">{selectedRecord.serviceType}</p>
              </div>
              <div>
                <span className="text-muted-foreground">服务地点</span>
                <p className="font-medium text-xs">{selectedRecord.location}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              生命体征
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              {selectedRecord.vitals.bloodPressure && (
                <div className="flex items-center gap-2 p-2 bg-red-50 rounded border border-red-100">
                  <Heart className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="text-xs text-red-700">血压</p>
                    <p className="font-medium text-red-800">{selectedRecord.vitals.bloodPressure} mmHg</p>
                  </div>
                </div>
              )}
              {selectedRecord.vitals.heartRate && (
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-100">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-blue-700">心率</p>
                    <p className="font-medium text-blue-800">{selectedRecord.vitals.heartRate} bpm</p>
                  </div>
                </div>
              )}
              {selectedRecord.vitals.temperature && (
                <div className="flex items-center gap-2 p-2 bg-orange-50 rounded border border-orange-100">
                  <Thermometer className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-xs text-orange-700">体温</p>
                    <p className="font-medium text-orange-800">{selectedRecord.vitals.temperature}°C</p>
                  </div>
                </div>
              )}
              {selectedRecord.vitals.bloodSugar && (
                <div className="flex items-center gap-2 p-2 bg-purple-50 rounded border border-purple-100">
                  <Droplets className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-xs text-purple-700">血糖</p>
                    <p className="font-medium text-purple-800">{selectedRecord.vitals.bloodSugar} mmol/L</p>
                  </div>
                </div>
              )}
              {selectedRecord.vitals.weight && (
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-100">
                  <Weight className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-xs text-green-700">体重</p>
                    <p className="font-medium text-green-800">{selectedRecord.vitals.weight} kg</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              观察记录
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{selectedRecord.observations}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-primary" />
              医疗建议
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{selectedRecord.recommendations}</p>
            {selectedRecord.nextVisit && (
              <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-100">
                <p className="text-xs text-blue-700">下次访问</p>
                <p className="font-medium text-blue-800">{selectedRecord.nextVisit}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (selectedPatient) {
    return (
      <div className={`space-y-4 ${isMobile ? "px-4 py-4" : "px-6 py-6 max-w-2xl mx-auto"}`}>
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedPatient(null)
              setEditingPatient(false)
              setEditedPatientData({})
            }}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            ←
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-800">{selectedPatient.name}</h1>
            <p className="text-sm text-gray-600">患者档案管理</p>
          </div>
          <div className="flex gap-2">
            {editingPatient && (
              <Button variant="outline" size="sm" onClick={cancelEditing} className="bg-transparent">
                取消
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleEditPatient} className="bg-transparent">
              <Edit className="h-4 w-4 mr-1" />
              {editingPatient ? "保存" : "编辑"}
            </Button>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              基本信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {editingPatient ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">姓名</Label>
                  <Input
                    value={editedPatientData.name || ""}
                    onChange={(e) => updateEditedPatientData("name", e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">年龄</Label>
                  <Input
                    value={editedPatientData.age || ""}
                    onChange={(e) => updateEditedPatientData("age", Number.parseInt(e.target.value) || 0)}
                    type="number"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">性别</Label>
                  <Select
                    value={editedPatientData.gender || ""}
                    onValueChange={(value) => updateEditedPatientData("gender", value)}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="男">男</SelectItem>
                      <SelectItem value="女">女</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">套餐类型</Label>
                  <Select
                    value={editedPatientData.packageType || ""}
                    onValueChange={(value) => updateEditedPatientData("packageType", value)}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="基础套餐">基础套餐</SelectItem>
                      <SelectItem value="标准套餐">标准套餐</SelectItem>
                      <SelectItem value="VIP套餐">VIP套餐</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">年龄</span>
                  <p className="font-medium">{selectedPatient.age}岁</p>
                </div>
                <div>
                  <span className="text-muted-foreground">性别</span>
                  <p className="font-medium">{selectedPatient.gender}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">关系</span>
                  <p className="font-medium">{selectedPatient.relationship}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">套餐类型</span>
                  <p className="font-medium">{selectedPatient.packageType}</p>
                </div>
              </div>
            )}

            <div className="pt-2 border-t">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">健康状况</span>
              </div>
              {editingPatient ? (
                <Input
                  value={editedPatientData.conditions?.join(", ") || ""}
                  onChange={(e) =>
                    updateEditedPatientData(
                      "conditions",
                      e.target.value.split(", ").filter((c) => c.trim()),
                    )
                  }
                  placeholder="如：高血压、糖尿病等"
                  className="text-sm"
                />
              ) : (
                <div className="flex gap-1 flex-wrap">
                  {selectedPatient.conditions.map((condition, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {condition}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {(selectedPatient.medications || editingPatient) && (
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <Pill className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">用药情况</span>
                </div>
                {editingPatient ? (
                  <Input
                    value={editedPatientData.medications?.join(", ") || ""}
                    onChange={(e) =>
                      updateEditedPatientData(
                        "medications",
                        e.target.value.split(", ").filter((m) => m.trim()),
                      )
                    }
                    placeholder="如：降压药、胰岛素等"
                    className="text-sm"
                  />
                ) : (
                  <div className="flex gap-1 flex-wrap">
                    {selectedPatient.medications?.map((medication, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {medication}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="pt-2 border-t">
              <Badge variant="outline" className={getPaymentStatusColor(selectedPatient.paymentStatus)}>
                {getPaymentStatusText(selectedPatient.paymentStatus)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {editingPatient && (
          <Card className="shadow-sm border-blue-200 bg-blue-50/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-blue-700">
                <Edit className="h-4 w-4" />
                <span className="text-sm font-medium">编辑模式</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">修改完成后请点击"保存"按钮保存更改</p>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                健康记录 ({selectedPatient.records?.length || 0})
              </div>
              <Button size="sm" onClick={() => setShowNewRecordModal(true)} className="bg-primary/90 hover:bg-primary">
                <Plus className="h-4 w-4 mr-1" />
                新记录
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedPatient.records && selectedPatient.records.length > 0 ? (
              selectedPatient.records.map((record) => (
                <div
                  key={record.id}
                  className="p-3 bg-muted/50 rounded-lg border cursor-pointer hover:bg-muted/70 transition-colors"
                  onClick={() => setSelectedRecord(record)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{record.serviceType}</p>
                      <p className="text-xs text-muted-foreground">
                        {record.date} {record.time}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getStatusColor(record.status)}>
                        {getStatusText(record.status)}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{record.observations}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    {record.photos.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Camera className="h-3 w-3" />
                        <span>{record.photos.length}</span>
                      </div>
                    )}
                    {record.audioNotes.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Mic className="h-3 w-3" />
                        <span>{record.audioNotes.length}</span>
                      </div>
                    )}
                    {Object.keys(record.vitals).length > 0 && (
                      <div className="flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        <span>{Object.keys(record.vitals).length}项体征</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">暂无健康记录</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">患者操作</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent"
              onClick={() => setShowNewRecordModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              添加健康记录
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Calendar className="h-4 w-4 mr-2" />
              安排服务预约
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Phone className="h-4 w-4 mr-2" />
              联系患者
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <CreditCard className="h-4 w-4 mr-2" />
              查看付款记录
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (selectedFamily) {
    const allFamilyRecords = selectedFamily.members
      .reduce((acc, member) => {
        if (member.records) {
          return [
            ...acc,
            ...member.records.map((record) => ({ ...record, patientName: member.name, patientId: member.id })),
          ]
        }
        return acc
      }, [])
      .sort((a, b) => new Date(b.date + " " + b.time) - new Date(a.date + " " + a.time))

    return (
      <div className={`space-y-4 ${isMobile ? "px-4 py-4" : "px-6 py-6 max-w-2xl mx-auto"}`}>
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedFamily(null)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            ←
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">{selectedFamily.householdHead}家</h1>
            <p className="text-sm text-gray-600">家庭档案管理</p>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              家庭信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{selectedFamily.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{selectedFamily.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">最近服务: {selectedFamily.lastService}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">家庭成员 ({selectedFamily.totalMembers}人)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedFamily.members.map((member) => (
              <div key={member.id} className="p-3 bg-muted/50 rounded-lg border space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="font-medium">{member.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">({member.relationship})</span>
                    </div>
                  </div>
                  <Badge variant="outline" className={getPaymentStatusColor(member.paymentStatus)}>
                    {getPaymentStatusText(member.paymentStatus)}
                  </Badge>
                </div>

                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    {member.age}岁 | {member.gender}
                  </p>
                  <div className="flex items-center gap-2">
                    <Heart className="h-3 w-3" />
                    <span>{member.conditions.join(", ")}</span>
                  </div>
                  {member.medications && (
                    <div className="flex items-center gap-2">
                      <Pill className="h-3 w-3" />
                      <span>{member.medications.join(", ")}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>最近服务: {member.lastService}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-3 w-3" />
                    <span>{member.packageType}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => setSelectedPatient(member)}
                  >
                    查看详情
                  </Button>
                  {member.paymentStatus === "overdue" && (
                    <Button size="sm" variant="outline" className="text-orange-600 border-orange-300 bg-transparent">
                      催缴
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="text-blue-800">家庭健康记录</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {allFamilyRecords.length}条记录
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {allFamilyRecords.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {allFamilyRecords.map((record) => (
                  <div
                    key={`${record.patientId}-${record.id}`}
                    className="p-4 bg-white rounded-lg border border-blue-100 cursor-pointer hover:shadow-md transition-all duration-200"
                    onClick={() => setSelectedRecord(record)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-blue-800">{record.patientName}</span>
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
                            {record.serviceType}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {record.date} {record.time}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getStatusColor(record.status)}>
                          {getStatusText(record.status)}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-blue-400" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2 mb-3">{record.observations}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {record.photos.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Camera className="h-3 w-3 text-blue-500" />
                          <span>{record.photos.length}张照片</span>
                        </div>
                      )}
                      {record.audioNotes.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Mic className="h-3 w-3 text-blue-500" />
                          <span>{record.audioNotes.length}条录音</span>
                        </div>
                      )}
                      {Object.keys(record.vitals).length > 0 && (
                        <div className="flex items-center gap-1">
                          <Activity className="h-3 w-3 text-blue-500" />
                          <span>{Object.keys(record.vitals).length}项体征</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">暂无健康记录</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">家庭操作</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <CreditCard className="h-4 w-4 mr-2" />
              查看家庭付款记录
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Plus className="h-4 w-4 mr-2" />
              添加新成员
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${isMobile ? "px-4 py-4" : "px-6 py-6 max-w-2xl mx-auto"}`}>
      <div className="flex items-center gap-3 mb-6">
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="搜索患者或家庭"
          className="flex-1"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowNewFamilyModal(true)}
          className="bg-primary/90 hover:bg-primary"
        >
          <Plus className="h-4 w-4 mr-1" />
          新家庭
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {mockFamilies.map((family) => (
          <div
            key={family.id}
            className="p-3 bg-muted/50 rounded-lg border cursor-pointer hover:bg-muted/70 transition-colors"
            onClick={() => setSelectedFamily(family)}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="font-medium text-sm">{family.householdHead}家</h2>
                <p className="text-xs text-muted-foreground">家庭成员: {family.totalMembers}人</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getPaymentStatusColor(family.members[0].paymentStatus)}>
                  {getPaymentStatusText(family.members[0].paymentStatus)}
                </Badge>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">最近服务: {family.lastService}</p>
          </div>
        ))}
      </div>

      {showNewFamilyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">新建家庭档案</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowNewFamilyModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">户主姓名</label>
                    <Input
                      value={newFamily.householdHead}
                      onChange={(e) => setNewFamily((prev) => ({ ...prev, householdHead: e.target.value }))}
                      placeholder="请输入户主姓名"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">联系电话</label>
                    <Input
                      value={newFamily.phone}
                      onChange={(e) => setNewFamily((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="请输入联系电话"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">家庭地址</label>
                  <Input
                    value={newFamily.address}
                    onChange={(e) => setNewFamily((prev) => ({ ...prev, address: e.target.value }))}
                    placeholder="请输入家庭地址"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">家庭成员</h3>
                    <Button variant="outline" size="sm" onClick={addFamilyMember}>
                      <Plus className="h-4 w-4 mr-1" />
                      添加成员
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {newFamily.members.map((member, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium">成员 {index + 1}</span>
                          {newFamily.members.length > 1 && (
                            <Button variant="ghost" size="sm" onClick={() => removeFamilyMember(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">姓名</label>
                            <Input
                              value={member.name}
                              onChange={(e) => updateFamilyMember(index, "name", e.target.value)}
                              placeholder="姓名"
                              size="sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">年龄</label>
                            <Input
                              value={member.age}
                              onChange={(e) => updateFamilyMember(index, "age", e.target.value)}
                              placeholder="年龄"
                              size="sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">性别</label>
                            <select
                              value={member.gender}
                              onChange={(e) => updateFamilyMember(index, "gender", e.target.value)}
                              className="w-full px-3 py-1 text-sm border border-input rounded-md"
                            >
                              <option value="">选择性别</option>
                              <option value="男">男</option>
                              <option value="女">女</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">关系</label>
                            <Input
                              value={member.relationship}
                              onChange={(e) => updateFamilyMember(index, "relationship", e.target.value)}
                              placeholder="与户主关系"
                              size="sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">套餐类型</label>
                            <select
                              value={member.packageType}
                              onChange={(e) => updateFamilyMember(index, "packageType", e.target.value)}
                              className="w-full px-3 py-1 text-sm border border-input rounded-md"
                            >
                              <option value="基础套餐">基础套餐</option>
                              <option value="标准套餐">标准套餐</option>
                              <option value="高级套餐">高级套餐</option>
                            </select>
                          </div>
                        </div>

                        <div className="mt-3">
                          <label className="text-xs text-muted-foreground mb-1 block">健康状况</label>
                          <Input
                            value={member.conditions}
                            onChange={(e) => updateFamilyMember(index, "conditions", e.target.value)}
                            placeholder="请输入健康状况或疾病史"
                            size="sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setShowNewFamilyModal(false)} className="flex-1">
                    取消
                  </Button>
                  <Button onClick={handleSubmitNewFamily} className="flex-1">
                    创建家庭档案
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
