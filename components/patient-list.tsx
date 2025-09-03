"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDeviceType } from "@/hooks/use-wechat-responsive"
import { useIsMobile } from "@/hooks/use-mobile"
import { WechatPatientHeader } from "@/components/wechat-patient-header"
import { cn } from "@/lib/utils"
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
  Search,
  Filter,
  UserPlus,
  MessageCircle,
  Clock,
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
  const [showFilterOptions, setShowFilterOptions] = useState(false)
  const deviceType = useDeviceType()
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

  // 过滤搜索逻辑
  const filteredFamilies = mockFamilies.filter(
    (family) =>
      family.householdHead.toLowerCase().includes(searchTerm.toLowerCase()) ||
      family.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      family.members.some((member) => member.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (selectedRecord) {
    return (
      <div className={cn(
        "min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30",
        deviceType === "mobile" ? "px-3 py-4" : deviceType === "tablet" ? "px-4 py-5" : "px-6 py-6 max-w-4xl mx-auto"
      )}>
        {/* 微信小程序风格的返回头 */}
        <div className="flex items-center gap-3 mb-6 px-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedRecord(null)}
            className={cn(
              "rounded-full hover:bg-white/80 active:scale-95 transition-all duration-200",
              "bg-white/60 backdrop-blur-md shadow-lg border border-white/20",
              deviceType === "mobile" ? "h-10 w-10" : "h-9 w-9"
            )}
          >
            <ChevronRight className={cn(
              "text-gray-700 rotate-180",
              deviceType === "mobile" ? "h-5 w-5" : "h-4 w-4"
            )} />
          </Button>
          <div className="flex-1">
            <h1 className={cn(
              "font-semibold text-gray-900",
              deviceType === "mobile" ? "text-xl" : "text-lg"
            )}>服务记录</h1>
            <p className={cn(
              "text-gray-600",
              deviceType === "mobile" ? "text-sm" : "text-xs"
            )}>{selectedPatient?.name}</p>
          </div>
        </div>

        {/* 其余记录详情保持现有逻辑 */}
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
      <div className={cn(
        "min-h-screen bg-gradient-to-br from-gray-50/80 via-blue-50/40 to-indigo-50/30",
        "selection:bg-blue-200 selection:text-blue-900", // 改善文字选择体验
        deviceType === "mobile" ? "px-3 py-4" : deviceType === "tablet" ? "px-4 py-5" : "px-6 py-6 max-w-4xl mx-auto"
      )}>
        {/* 微信小程序风格的顶部导航 - 提升设计 */}
        <div className={cn(
          "flex items-center gap-3 mb-6 px-1 relative",
          "before:absolute before:inset-0 before:bg-white/60 before:backdrop-blur-md before:rounded-2xl before:-z-10",
          "before:shadow-lg before:border before:border-white/30",
          deviceType === "mobile" ? "py-3" : "py-2"
        )}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedPatient(null)
              setEditingPatient(false)
              setEditedPatientData({})
            }}
            className={cn(
              "rounded-full hover:bg-white/90 active:scale-95 transition-all duration-200",
              "bg-white/80 backdrop-blur-md shadow-lg border border-white/40",
              "hover:shadow-xl group relative overflow-hidden",
              deviceType === "mobile" ? "h-10 w-10" : "h-9 w-9"
            )}
            aria-label="返回家庭列表"
          >
            <ChevronRight className={cn(
              "text-gray-700 rotate-180",
              deviceType === "mobile" ? "h-5 w-5" : "h-4 w-4"
            )} />
          </Button>
          <div className="flex-1">
            <h1 className={cn(
              "font-semibold text-gray-900",
              deviceType === "mobile" ? "text-xl" : "text-lg"
            )}>{selectedPatient.name}</h1>
            <p className={cn(
              "text-gray-600",
              deviceType === "mobile" ? "text-sm" : "text-xs"
            )}>患者档案管理</p>
          </div>
          <div className="flex gap-2">
            {editingPatient && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={cancelEditing}
                className={cn(
                  "bg-white/80 hover:bg-white border-gray-200 text-gray-700",
                  "rounded-xl shadow-md backdrop-blur-sm active:scale-95 transition-all duration-200",
                  deviceType === "mobile" ? "px-3 py-2 text-xs" : "px-2 py-1.5 text-xs"
                )}
              >
                取消
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleEditPatient}
              className={cn(
                "bg-blue-500/10 hover:bg-blue-500/20 border-blue-200 text-blue-700",
                "rounded-xl shadow-md backdrop-blur-sm active:scale-95 transition-all duration-200",
                deviceType === "mobile" ? "px-3 py-2 text-xs gap-1" : "px-2 py-1.5 text-xs gap-1"
              )}
            >
              <Edit className={cn(
                deviceType === "mobile" ? "h-3.5 w-3.5" : "h-3 w-3"
              )} />
              {editingPatient ? "保存" : "编辑"}
            </Button>
          </div>
        </div>

        {/* 微信风格的基本信息卡片 - 提升设计 */}
        <Card className={cn(
          "shadow-xl border-0 bg-white/98 backdrop-blur-xl rounded-3xl mb-4",
          "border border-white/30 relative overflow-hidden",
          "before:absolute before:inset-0 before:bg-gradient-to-br before:from-blue-50/30 before:to-indigo-50/20 before:-z-10"
        )}>
          <CardHeader className="pb-3">
            <CardTitle className={cn(
              "flex items-center gap-3",
              deviceType === "mobile" ? "text-base" : "text-sm"
            )}>
              <div className="flex items-center justify-center w-8 h-8 bg-blue-500/10 rounded-full">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-gray-800">基本信息</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {editingPatient ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className={cn(
                    "text-gray-600 font-medium",
                    deviceType === "mobile" ? "text-xs" : "text-[10px]"
                  )}>姓名</Label>
                  <Input
                    value={editedPatientData.name || ""}
                    onChange={(e) => updateEditedPatientData("name", e.target.value)}
                    className={cn(
                      "border-gray-200 bg-gray-50/50 rounded-xl focus:bg-white transition-all duration-200",
                      deviceType === "mobile" ? "text-sm h-10" : "text-xs h-8"
                    )}
                  />
                </div>
                <div className="space-y-1">
                  <Label className={cn(
                    "text-gray-600 font-medium",
                    deviceType === "mobile" ? "text-xs" : "text-[10px]"
                  )}>年龄</Label>
                  <Input
                    value={editedPatientData.age || ""}
                    onChange={(e) => updateEditedPatientData("age", Number.parseInt(e.target.value) || 0)}
                    type="number"
                    className={cn(
                      "border-gray-200 bg-gray-50/50 rounded-xl focus:bg-white transition-all duration-200",
                      deviceType === "mobile" ? "text-sm h-10" : "text-xs h-8"
                    )}
                  />
                </div>
                <div className="space-y-1">
                  <Label className={cn(
                    "text-gray-600 font-medium",
                    deviceType === "mobile" ? "text-xs" : "text-[10px]"
                  )}>性别</Label>
                  <Select
                    value={editedPatientData.gender || ""}
                    onValueChange={(value) => updateEditedPatientData("gender", value)}
                  >
                    <SelectTrigger className={cn(
                      "border-gray-200 bg-gray-50/50 rounded-xl focus:bg-white transition-all duration-200",
                      deviceType === "mobile" ? "text-sm h-10" : "text-xs h-8"
                    )}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="男">男</SelectItem>
                      <SelectItem value="女">女</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className={cn(
                    "text-gray-600 font-medium",
                    deviceType === "mobile" ? "text-xs" : "text-[10px]"
                  )}>套餐类型</Label>
                  <Select
                    value={editedPatientData.packageType || ""}
                    onValueChange={(value) => updateEditedPatientData("packageType", value)}
                  >
                    <SelectTrigger className={cn(
                      "border-gray-200 bg-gray-50/50 rounded-xl focus:bg-white transition-all duration-200",
                      deviceType === "mobile" ? "text-sm h-10" : "text-xs h-8"
                    )}>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className={cn(
                    "text-gray-500 font-medium",
                    deviceType === "mobile" ? "text-xs" : "text-[10px]"
                  )}>年龄</span>
                  <p className={cn(
                    "font-semibold text-gray-800",
                    deviceType === "mobile" ? "text-sm" : "text-xs"
                  )}>{selectedPatient.age}岁</p>
                </div>
                <div className="space-y-1">
                  <span className={cn(
                    "text-gray-500 font-medium",
                    deviceType === "mobile" ? "text-xs" : "text-[10px]"
                  )}>性别</span>
                  <p className={cn(
                    "font-semibold text-gray-800",
                    deviceType === "mobile" ? "text-sm" : "text-xs"
                  )}>{selectedPatient.gender}</p>
                </div>
                <div className="space-y-1">
                  <span className={cn(
                    "text-gray-500 font-medium",
                    deviceType === "mobile" ? "text-xs" : "text-[10px]"
                  )}>关系</span>
                  <p className={cn(
                    "font-semibold text-gray-800",
                    deviceType === "mobile" ? "text-sm" : "text-xs"
                  )}>{selectedPatient.relationship}</p>
                </div>
                <div className="space-y-1">
                  <span className={cn(
                    "text-gray-500 font-medium",
                    deviceType === "mobile" ? "text-xs" : "text-[10px]"
                  )}>套餐类型</span>
                  <p className={cn(
                    "font-semibold text-gray-800",
                    deviceType === "mobile" ? "text-sm" : "text-xs"
                  )}>{selectedPatient.packageType}</p>
                </div>
              </div>
            )}

            {/* 健康状况区域 */}
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center justify-center w-6 h-6 bg-red-500/10 rounded-full">
                  <Heart className="h-3 w-3 text-red-500" />
                </div>
                <span className={cn(
                  "font-medium text-gray-700",
                  deviceType === "mobile" ? "text-sm" : "text-xs"
                )}>健康状况</span>
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
                  className={cn(
                    "border-gray-200 bg-gray-50/50 rounded-xl focus:bg-white transition-all duration-200",
                    deviceType === "mobile" ? "text-sm" : "text-xs"
                  )}
                />
              ) : (
                <div className="flex gap-2 flex-wrap">
                  {selectedPatient.conditions.map((condition, index) => (
                    <Badge key={index} 
                      variant="secondary" 
                      className={cn(
                        "bg-red-50 text-red-700 border border-red-200 rounded-lg",
                        deviceType === "mobile" ? "text-xs px-2 py-1" : "text-[10px] px-1.5 py-0.5"
                      )}
                    >
                      {condition}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* 用药情况区域 */}
            {(selectedPatient.medications || editingPatient) && (
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-blue-500/10 rounded-full">
                    <Pill className="h-3 w-3 text-blue-500" />
                  </div>
                  <span className={cn(
                    "font-medium text-gray-700",
                    deviceType === "mobile" ? "text-sm" : "text-xs"
                  )}>用药情况</span>
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
                    className={cn(
                      "border-gray-200 bg-gray-50/50 rounded-xl focus:bg-white transition-all duration-200",
                      deviceType === "mobile" ? "text-sm" : "text-xs"
                    )}
                  />
                ) : (
                  <div className="flex gap-2 flex-wrap">
                    {selectedPatient.medications?.map((medication, index) => (
                      <Badge key={index} 
                        variant="outline" 
                        className={cn(
                          "bg-blue-50 text-blue-700 border border-blue-200 rounded-lg",
                          deviceType === "mobile" ? "text-xs px-2 py-1" : "text-[10px] px-1.5 py-0.5"
                        )}
                      >
                        {medication}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 支付状态 */}
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-gray-500 font-medium",
                  deviceType === "mobile" ? "text-sm" : "text-xs"
                )}>支付状态</span>
                <Badge variant="outline" className={cn(
                  getPaymentStatusColor(selectedPatient.paymentStatus),
                  "rounded-lg font-medium",
                  deviceType === "mobile" ? "text-xs px-2 py-1" : "text-[10px] px-1.5 py-0.5"
                )}>
                  {getPaymentStatusText(selectedPatient.paymentStatus)}
                </Badge>
              </div>
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
      .reduce((acc: any[], member) => {
        if (member.records) {
          return [
            ...acc,
            ...member.records.map((record) => ({ ...record, patientName: member.name, patientId: member.id })),
          ]
        }
        return acc
      }, [])
      .sort((a: any, b: any) => new Date(b.date + " " + b.time).getTime() - new Date(a.date + " " + a.time).getTime())

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
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40",
      "selection:bg-blue-200 selection:text-blue-900", // 改善文字选择体验
      deviceType === "mobile" ? "pb-4" : deviceType === "tablet" ? "pb-5" : "pb-6 max-w-5xl mx-auto"
    )}>
      {/* 微信小程序风格的页面头部 */}
      <WechatPatientHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddFamily={() => setShowNewFamilyModal(true)}
        onFilter={() => setShowFilterOptions(!showFilterOptions)}
        showFilter={showFilterOptions}
        totalPatients={mockFamilies.reduce((sum, family) => sum + family.totalMembers, 0)}
        totalFamilies={mockFamilies.length}
      />

      {/* 微信小程序风格的家庭列表 */}
      <div className={cn(
        "space-y-4",
        deviceType === "mobile" ? "px-3 mt-4" : deviceType === "tablet" ? "px-4 mt-5" : "px-6 mt-6"
      )}>
        {filteredFamilies.map((family) => (
          <Card
            key={family.id}
            className={cn(
              "group bg-white/98 backdrop-blur-xl border-0 rounded-3xl overflow-hidden",
              "shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer",
              "hover:scale-[1.02] active:scale-[0.98] transform-gpu",
              "border border-white/50 hover:border-blue-200/70",
              "ring-1 ring-gray-900/[0.02] hover:ring-blue-200/50",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30",
              "focus-visible:border-blue-400/80" // 增强焦点可视性
            )}
            onClick={() => setSelectedFamily(family)}
            role="button"
            tabIndex={0}
            aria-label={`查看 ${family.householdHead}家的详细信息，共${family.totalMembers}位成员`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setSelectedFamily(family)
              }
            }}
          >
            <CardContent className="p-0">
              {/* 卡片头部 - 采用更现代的微信小程序风格 */}
              <div className={cn(
                "bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-purple-50/50",
                "border-b border-blue-100/70 relative overflow-hidden",
                deviceType === "mobile" ? "px-4 py-4" : "px-5 py-5"
              )}>
                {/* 装饰性背景元素 - 增强立体感 */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-200/25 to-transparent rounded-full -translate-y-16 translate-x-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-200/20 to-transparent rounded-full translate-y-12 -translate-x-12" />
                <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-gradient-to-br from-purple-200/15 to-transparent rounded-full transform rotate-45" />
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center",
                      "shadow-xl border border-blue-300/60 relative overflow-hidden",
                      "group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300",
                      deviceType === "mobile" ? "w-12 h-12" : "w-14 h-14"
                    )}>
                      {/* 图标背景光效 - 增强视觉效果 */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/25 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-transparent to-black/5 opacity-50" />
                      <Users className={cn(
                        "text-white relative z-10",
                        deviceType === "mobile" ? "h-6 w-6" : "h-7 w-7"
                      )} />
                    </div>
                    <div>
                      <h3 className={cn(
                        "font-bold text-gray-900 mb-1",
                        deviceType === "mobile" ? "text-lg" : "text-base"
                      )}>{family.householdHead}家</h3>
                      <div className="flex items-center gap-3">
                        <p className={cn(
                          "text-gray-600 flex items-center gap-1.5 font-medium",
                          deviceType === "mobile" ? "text-sm" : "text-xs"
                        )}>
                          <Users className="h-3.5 w-3.5 text-blue-500" />
                          {family.totalMembers}位家庭成员
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={cn(
                      getPaymentStatusColor(family.members[0].paymentStatus),
                      "rounded-full font-semibold border-0 shadow-md backdrop-blur-sm",
                      deviceType === "mobile" ? "text-xs px-3 py-1.5" : "text-[10px] px-2.5 py-1"
                    )}>
                      {getPaymentStatusText(family.members[0].paymentStatus)}
                    </Badge>
                    <div className={cn(
                      "bg-blue-100/60 rounded-full p-1.5 group-hover:bg-blue-200/80 transition-colors duration-200",
                      "min-w-[44px] min-h-[44px] flex items-center justify-center", // 确保触摸区域足够大
                      deviceType === "mobile" ? "" : "p-1"
                    )}>
                      <ChevronRight className={cn(
                        "text-blue-600 group-hover:text-blue-700 transition-colors duration-200",
                        deviceType === "mobile" ? "h-4 w-4" : "h-3.5 w-3.5"
                      )} />
                    </div>
                  </div>
                </div>
              </div>

                  {/* 家庭详情信息 - 优化渐变和视觉层次 */}
              <div className={cn(
                "bg-gradient-to-br from-white/95 via-white/90 to-gray-50/80",
                deviceType === "mobile" ? "p-4" : "p-5"
              )}>
                <div className="space-y-4">
                  {/* 联系信息区域 - 提升卡片样式 */}
                  <div className="bg-gradient-to-br from-gray-50/90 to-blue-50/30 rounded-2xl p-3 space-y-3 border border-gray-100/50 shadow-inner">
                    {/* 地址信息 - 提升视觉效果 */}
                    <div className="flex items-start gap-3 group/item hover:bg-white/50 rounded-xl p-2 -m-2 transition-all duration-200">
                      <div className="bg-blue-100/80 hover:bg-blue-200/60 transition-colors duration-200 p-1.5 rounded-lg group-hover/item:scale-110 transform transition-transform duration-200">
                        <MapPin className={cn(
                          "text-blue-600",
                          deviceType === "mobile" ? "h-3.5 w-3.5" : "h-3 w-3"
                        )} />
                      </div>
                      <div className="flex-1">
                        <p className={cn(
                          "text-gray-500 font-medium mb-0.5",
                          deviceType === "mobile" ? "text-xs" : "text-[10px]"
                        )}>住址</p>
                        <p className={cn(
                          "text-gray-800 font-medium",
                          deviceType === "mobile" ? "text-sm leading-relaxed" : "text-xs leading-relaxed"
                        )}>{family.address}</p>
                      </div>
                    </div>
                    
                    {/* 联系电话 - 提升视觉效果 */}
                    <div className="flex items-center gap-3 group/item hover:bg-white/50 rounded-xl p-2 -m-2 transition-all duration-200">
                      <div className="bg-green-100/80 hover:bg-green-200/60 transition-colors duration-200 p-1.5 rounded-lg group-hover/item:scale-110 transform transition-transform duration-200">
                        <Phone className={cn(
                          "text-green-600",
                          deviceType === "mobile" ? "h-3.5 w-3.5" : "h-3 w-3"
                        )} />
                      </div>
                      <div className="flex-1">
                        <p className={cn(
                          "text-gray-500 font-medium mb-0.5",
                          deviceType === "mobile" ? "text-xs" : "text-[10px]"
                        )}>联系电话</p>
                        <p className={cn(
                          "text-gray-800 font-medium",
                          deviceType === "mobile" ? "text-sm" : "text-xs"
                        )}>{family.phone}</p>
                      </div>
                    </div>
                    
                    {/* 最近服务时间 - 提升视觉效果 */}
                    <div className="flex items-center gap-3 group/item hover:bg-white/50 rounded-xl p-2 -m-2 transition-all duration-200">
                      <div className="bg-purple-100/80 hover:bg-purple-200/60 transition-colors duration-200 p-1.5 rounded-lg group-hover/item:scale-110 transform transition-transform duration-200">
                        <Clock className={cn(
                          "text-purple-600",
                          deviceType === "mobile" ? "h-3.5 w-3.5" : "h-3 w-3"
                        )} />
                      </div>
                      <div className="flex-1">
                        <p className={cn(
                          "text-gray-500 font-medium mb-0.5",
                          deviceType === "mobile" ? "text-xs" : "text-[10px]"
                        )}>最近服务</p>
                        <p className={cn(
                          "text-gray-800 font-medium",
                          deviceType === "mobile" ? "text-sm" : "text-xs"
                        )}>{family.lastService}</p>
                      </div>
                    </div>
                  </div>

                {/* 家庭成员预览 */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className={cn(
                      "text-gray-800 font-bold flex items-center gap-2",
                      deviceType === "mobile" ? "text-sm" : "text-xs"
                    )}>
                      <User className="h-4 w-4 text-indigo-600" />
                      家庭成员
                    </h4>
                    <Badge variant="secondary" className={cn(
                      "bg-indigo-100/80 text-indigo-700 border-indigo-200/50 rounded-full",
                      deviceType === "mobile" ? "text-xs px-2 py-0.5" : "text-[10px] px-1.5 py-0.5"
                    )}>
                      {family.totalMembers}人
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {family.members.slice(0, 3).map((member, index) => (
                      <div key={member.id} className={cn(
                        "flex items-center gap-3 bg-gradient-to-r from-blue-50/60 to-indigo-50/40",
                        "rounded-xl border border-blue-100/60 transition-all duration-200",
                        "hover:from-blue-50/90 hover:to-indigo-50/70 hover:border-blue-200/80 hover:shadow-md",
                        "group/member cursor-pointer active:scale-98 transform",
                        deviceType === "mobile" ? "p-3" : "p-2.5"
                      )}>
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-1.5 rounded-lg group-hover/member:scale-110 transition-transform duration-200">
                          <User className={cn(
                            "text-white",
                            deviceType === "mobile" ? "h-3.5 w-3.5" : "h-3 w-3"
                          )} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={cn(
                              "text-gray-800 font-semibold",
                              deviceType === "mobile" ? "text-sm" : "text-xs"
                            )}>{member.name}</span>
                            <Badge variant="outline" className={cn(
                              "bg-blue-50/80 text-blue-700 border-blue-200/50 rounded-full px-1.5 py-0",
                              deviceType === "mobile" ? "text-[10px]" : "text-[9px]"
                            )}>
                              {member.relationship}
                            </Badge>
                          </div>
                          <p className={cn(
                            "text-gray-600",
                            deviceType === "mobile" ? "text-xs" : "text-[10px]"
                          )}>{member.age}岁 · {member.gender}</p>
                        </div>
                      </div>
                    ))}
                    {family.members.length > 3 && (
                      <div className={cn(
                        "flex items-center justify-center bg-gradient-to-r from-indigo-100/80 to-purple-100/60",
                        "text-indigo-700 rounded-xl border border-indigo-200/50 font-semibold",
                        deviceType === "mobile" ? "px-3 py-2 text-sm" : "px-2 py-1.5 text-xs"
                      )}>
                        +{family.members.length - 3}更多
                      </div>
                    )}
                  </div>
                </div>

                {/* 快捷操作按钮 - 提升视觉效果和交互性 */}
                <div className="mt-4 pt-4 border-t border-gray-100/80">
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className={cn(
                        "bg-blue-50/70 hover:bg-blue-100/90 border-blue-200/70 hover:border-blue-300/80",
                        "text-blue-700 rounded-xl transition-all duration-200",
                        "active:scale-95 hover:shadow-lg backdrop-blur-sm flex-col gap-1.5",
                        "group/button border-2 hover:scale-105 transform",
                        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30",
                        deviceType === "mobile" ? "h-auto py-3 text-xs min-h-[48px]" : "h-auto py-2.5 text-[10px] min-h-[44px]"
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        // 添加预约逻辑
                      }}
                      aria-label={`为 ${family.householdHead}家预约服务`}
                    >
                      <Calendar className={cn(
                        "group-hover/button:scale-110 transition-transform duration-200",
                        deviceType === "mobile" ? "h-4 w-4" : "h-3.5 w-3.5"
                      )} />
                      预约
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className={cn(
                        "bg-green-50/70 hover:bg-green-100/90 border-green-200/70 hover:border-green-300/80",
                        "text-green-700 rounded-xl transition-all duration-200",
                        "active:scale-95 hover:shadow-lg backdrop-blur-sm flex-col gap-1.5",
                        "group/button border-2 hover:scale-105 transform",
                        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/30",
                        deviceType === "mobile" ? "h-auto py-3 text-xs min-h-[48px]" : "h-auto py-2.5 text-[10px] min-h-[44px]"
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        // 添加联系逻辑
                      }}
                      aria-label={`联系 ${family.householdHead}家`}
                    >
                      <MessageCircle className={cn(
                        "group-hover/button:scale-110 transition-transform duration-200",
                        deviceType === "mobile" ? "h-4 w-4" : "h-3.5 w-3.5"
                      )} />
                      联系
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className={cn(
                        "bg-purple-50/70 hover:bg-purple-100/90 border-purple-200/70 hover:border-purple-300/80",
                        "text-purple-700 rounded-xl transition-all duration-200",
                        "active:scale-95 hover:shadow-lg backdrop-blur-sm flex-col gap-1.5",
                        "group/button border-2 hover:scale-105 transform",
                        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-500/30",
                        deviceType === "mobile" ? "h-auto py-3 text-xs min-h-[48px]" : "h-auto py-2.5 text-[10px] min-h-[44px]"
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        // 添加记录逻辑
                      }}
                      aria-label={`为 ${family.householdHead}家添加健康记录`}
                    >
                      <FileText className={cn(
                        "group-hover/button:scale-110 transition-transform duration-200",
                        deviceType === "mobile" ? "h-4 w-4" : "h-3.5 w-3.5"
                      )} />
                      记录
                    </Button>
                  </div>
                </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 无数据时的占位符 */}
      {filteredFamilies.length === 0 && (
        <div className="text-center py-12">
          <div className={cn(
            "mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center",
            deviceType === "mobile" ? "w-16 h-16" : "w-12 h-12"
          )}>
            <Users className={cn(
              "text-gray-400",
              deviceType === "mobile" ? "h-8 w-8" : "h-6 w-6"
            )} />
          </div>
          <h3 className={cn(
            "font-medium text-gray-600 mb-2",
            deviceType === "mobile" ? "text-base" : "text-sm"
          )}>暂无患者数据</h3>
          <p className={cn(
            "text-gray-500 mb-4",
            deviceType === "mobile" ? "text-sm" : "text-xs"
          )}>请点击上方“新家庭”按钮添加患者信息</p>
          <Button
            onClick={() => setShowNewFamilyModal(true)}
            className={cn(
              "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
              "text-white border-0 rounded-2xl shadow-lg",
              "active:scale-95 transition-all duration-200 hover:shadow-xl",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30",
              deviceType === "mobile" ? "px-6 py-3 text-sm gap-2 min-h-[48px]" : "px-4 py-2 text-xs gap-1.5 min-h-[44px]"
            )}
            aria-label="创建首个家庭档案"
          >
            <UserPlus className={cn(
              deviceType === "mobile" ? "h-4 w-4" : "h-3.5 w-3.5"
            )} />
            创建首个家庭档案
          </Button>
        </div>
      )}

      {showNewFamilyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={cn(
            "bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20",
            "w-full max-h-[90vh] overflow-hidden",
            deviceType === "mobile" 
              ? "max-w-[95vw]" 
              : deviceType === "tablet" 
              ? "max-w-2xl" 
              : "max-w-3xl"
          )}>
            {/* 微信小程序风格的标题栏 */}
            <div className={cn(
              "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-b border-blue-100/50",
              "flex items-center justify-between",
              deviceType === "mobile" ? "px-4 py-4" : deviceType === "tablet" ? "px-5 py-4" : "px-6 py-5"
            )}>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-500/20 rounded-2xl">
                  <UserPlus className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h2 className={cn(
                    "font-bold text-gray-900",
                    deviceType === "mobile" ? "text-lg" : "text-xl"
                  )}>新建家庭档案</h2>
                  <p className={cn(
                    "text-gray-600",
                    deviceType === "mobile" ? "text-xs" : "text-sm"
                  )}>创建患者家庭健康档案</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => setShowNewFamilyModal(false)}
                className={cn(
                  "rounded-full hover:bg-white/80 active:scale-95 transition-all duration-200",
                  "bg-white/60 backdrop-blur-md shadow-md border border-white/20",
                  deviceType === "mobile" ? "h-8 w-8" : "h-9 w-9"
                )}
              >
                <X className={cn(
                  "text-gray-700",
                  deviceType === "mobile" ? "h-4 w-4" : "h-4 w-4"
                )} />
              </Button>
            </div>

            {/* 滚动内容区域 */}
            <div className={cn(
              "overflow-y-auto",
              deviceType === "mobile" ? "max-h-[75vh]" : "max-h-[80vh]"
            )}>
              <div className={cn(
                "space-y-6",
                deviceType === "mobile" ? "p-4" : deviceType === "tablet" ? "p-5" : "p-6"
              )}>
                {/* 基本信息卡片 */}
                <div className={cn(
                  "bg-white/80 backdrop-blur-md rounded-2xl border border-white/30 shadow-lg",
                  deviceType === "mobile" ? "p-4" : "p-5"
                )}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center justify-center w-6 h-6 bg-green-500/10 rounded-full">
                      <User className="h-3 w-3 text-green-600" />
                    </div>
                    <h3 className={cn(
                      "font-semibold text-gray-800",
                      deviceType === "mobile" ? "text-sm" : "text-base"
                    )}>基本信息</h3>
                  </div>
                  
                  <div className={cn(
                    "grid gap-4",
                    deviceType === "desktop" ? "grid-cols-2" : "grid-cols-1"
                  )}>
                    <div className="space-y-2">
                      <label className={cn(
                        "font-medium text-gray-700",
                        deviceType === "mobile" ? "text-xs" : "text-sm"
                      )}>户主姓名</label>
                      <Input
                        value={newFamily.householdHead}
                        onChange={(e) => setNewFamily((prev) => ({ ...prev, householdHead: e.target.value }))}
                        placeholder="请输入户主姓名"
                        className={cn(
                          "border-gray-200 bg-white/80 rounded-xl focus:bg-white transition-all duration-200",
                          "focus:border-blue-300 focus:ring-4 focus:ring-blue-100/50",
                          deviceType === "mobile" ? "h-10 text-sm" : "h-11 text-sm"
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className={cn(
                        "font-medium text-gray-700",
                        deviceType === "mobile" ? "text-xs" : "text-sm"
                      )}>联系电话</label>
                      <Input
                        value={newFamily.phone}
                        onChange={(e) => setNewFamily((prev) => ({ ...prev, phone: e.target.value }))}
                        placeholder="请输入联系电话"
                        className={cn(
                          "border-gray-200 bg-white/80 rounded-xl focus:bg-white transition-all duration-200",
                          "focus:border-blue-300 focus:ring-4 focus:ring-blue-100/50",
                          deviceType === "mobile" ? "h-10 text-sm" : "h-11 text-sm"
                        )}
                      />
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <label className={cn(
                      "font-medium text-gray-700",
                      deviceType === "mobile" ? "text-xs" : "text-sm"
                    )}>家庭地址</label>
                    <Input
                      value={newFamily.address}
                      onChange={(e) => setNewFamily((prev) => ({ ...prev, address: e.target.value }))}
                      placeholder="请输入家庭地址"
                      className={cn(
                        "border-gray-200 bg-white/80 rounded-xl focus:bg-white transition-all duration-200",
                        "focus:border-blue-300 focus:ring-4 focus:ring-blue-100/50",
                        deviceType === "mobile" ? "h-10 text-sm" : "h-11 text-sm"
                      )}
                    />
                  </div>
                </div>

                {/* 家庭成员卡片 */}
                <div className={cn(
                  "bg-white/80 backdrop-blur-md rounded-2xl border border-white/30 shadow-lg",
                  deviceType === "mobile" ? "p-4" : "p-5"
                )}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 bg-blue-500/10 rounded-full">
                        <Users className="h-3 w-3 text-blue-600" />
                      </div>
                      <h3 className={cn(
                        "font-semibold text-gray-800",
                        deviceType === "mobile" ? "text-sm" : "text-base"
                      )}>家庭成员</h3>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={addFamilyMember}
                      className={cn(
                        "bg-blue-50/80 hover:bg-blue-100/80 border-blue-200/80 text-blue-700",
                        "rounded-xl shadow-sm active:scale-95 transition-all duration-200",
                        deviceType === "mobile" ? "h-8 px-3 text-xs gap-1" : "h-9 px-4 text-sm gap-2"
                      )}
                    >
                      <Plus className={cn(
                        deviceType === "mobile" ? "h-3 w-3" : "h-4 w-4"
                      )} />
                      添加成员
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {newFamily.members.map((member, index) => (
                      <div key={index} className={cn(
                        "bg-gradient-to-r from-gray-50/80 to-gray-100/50 rounded-2xl border border-gray-200/50",
                        deviceType === "mobile" ? "p-3" : "p-4"
                      )}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-5 h-5 bg-gray-500/10 rounded-full">
                              <User className="h-2.5 w-2.5 text-gray-600" />
                            </div>
                            <span className={cn(
                              "font-medium text-gray-700",
                              deviceType === "mobile" ? "text-xs" : "text-sm"
                            )}>成员 {index + 1}</span>
                          </div>
                          {newFamily.members.length > 1 && (
                            <Button 
                              variant="ghost" 
                              onClick={() => removeFamilyMember(index)}
                              className={cn(
                                "rounded-full hover:bg-red-50 text-red-500 active:scale-95 transition-all duration-200",
                                deviceType === "mobile" ? "h-6 w-6" : "h-7 w-7"
                              )}
                            >
                              <Trash2 className={cn(
                                deviceType === "mobile" ? "h-3 w-3" : "h-3.5 w-3.5"
                              )} />
                            </Button>
                          )}
                        </div>

                        <div className={cn(
                          "grid gap-3",
                          deviceType === "desktop" ? "grid-cols-3" : deviceType === "tablet" ? "grid-cols-2" : "grid-cols-1"
                        )}>
                          <div className="space-y-1.5">
                            <label className={cn(
                              "font-medium text-gray-600",
                              deviceType === "mobile" ? "text-[10px]" : "text-xs"
                            )}>姓名</label>
                            <Input
                              value={member.name}
                              onChange={(e) => updateFamilyMember(index, "name", e.target.value)}
                              placeholder="姓名"
                              className={cn(
                                "border-gray-200 bg-white/80 rounded-lg focus:bg-white transition-all duration-200",
                                "focus:border-blue-300 focus:ring-2 focus:ring-blue-100/50",
                                deviceType === "mobile" ? "h-8 text-xs" : "h-9 text-sm"
                              )}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className={cn(
                              "font-medium text-gray-600",
                              deviceType === "mobile" ? "text-[10px]" : "text-xs"
                            )}>年龄</label>
                            <Input
                              value={member.age}
                              onChange={(e) => updateFamilyMember(index, "age", e.target.value)}
                              placeholder="年龄"
                              type="number"
                              className={cn(
                                "border-gray-200 bg-white/80 rounded-lg focus:bg-white transition-all duration-200",
                                "focus:border-blue-300 focus:ring-2 focus:ring-blue-100/50",
                                deviceType === "mobile" ? "h-8 text-xs" : "h-9 text-sm"
                              )}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className={cn(
                              "font-medium text-gray-600",
                              "block",
                              deviceType === "mobile" ? "text-[10px]" : "text-xs"
                            )}>性别</label>
                            <Select
                              value={member.gender}
                              onValueChange={(value) => updateFamilyMember(index, "gender", value)}
                            >
                              <SelectTrigger className={cn(
                                "w-full border-gray-200 bg-white/80 rounded-lg focus:bg-white",
                                "focus:border-blue-300 focus:ring-2 focus:ring-blue-100/50",
                                deviceType === "mobile" ? "h-8 text-xs px-2" : "h-9 text-sm px-3"
                              )}>
                                <SelectValue placeholder="选择性别" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="男">男</SelectItem>
                                <SelectItem value="女">女</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className={cn(
                          "grid gap-3 mt-3",
                          deviceType === "desktop" ? "grid-cols-2" : "grid-cols-1"
                        )}>
                          <div className="space-y-1.5">
                            <label className={cn(
                              "font-medium text-gray-600",
                              deviceType === "mobile" ? "text-[10px]" : "text-xs"
                            )}>关系</label>
                            <Input
                              value={member.relationship}
                              onChange={(e) => updateFamilyMember(index, "relationship", e.target.value)}
                              placeholder="与户主关系"
                              className={cn(
                                "border-gray-200 bg-white/80 rounded-lg focus:bg-white transition-all duration-200",
                                "focus:border-blue-300 focus:ring-2 focus:ring-blue-100/50",
                                deviceType === "mobile" ? "h-8 text-xs" : "h-9 text-sm"
                              )}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className={cn(
                              "font-medium text-gray-600",
                              "block",
                              deviceType === "mobile" ? "text-[10px]" : "text-xs"
                            )}>套餐类型</label>
                            <Select
                              value={member.packageType}
                              onValueChange={(value) => updateFamilyMember(index, "packageType", value)}
                            >
                              <SelectTrigger className={cn(
                                "w-full border-gray-200 bg-white/80 rounded-lg focus:bg-white",
                                "focus:border-blue-300 focus:ring-2 focus:ring-blue-100/50",
                                deviceType === "mobile" ? "h-8 text-xs px-2" : "h-9 text-sm px-3"
                              )}>
                                <SelectValue placeholder="选择套餐" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="基础套餐">基础套餐</SelectItem>
                                <SelectItem value="标准套餐">标准套餐</SelectItem>
                                <SelectItem value="VIP套餐">VIP套餐</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="mt-3 space-y-1.5">
                          <label className={cn(
                            "font-medium text-gray-600",
                            deviceType === "mobile" ? "text-[10px]" : "text-xs"
                          )}>健康状况</label>
                          <Input
                            value={member.conditions}
                            onChange={(e) => updateFamilyMember(index, "conditions", e.target.value)}
                            placeholder="请输入健康状况或疾病史（如：高血压、糖尿病等）"
                            className={cn(
                              "border-gray-200 bg-white/80 rounded-lg focus:bg-white transition-all duration-200",
                              "focus:border-blue-300 focus:ring-2 focus:ring-blue-100/50",
                              deviceType === "mobile" ? "h-8 text-xs" : "h-9 text-sm"
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 微信小程序风格的底部操作栏 */}
            <div className={cn(
              "bg-white/95 backdrop-blur-xl border-t border-gray-100/50",
              "flex gap-3",
              deviceType === "mobile" ? "p-4" : deviceType === "tablet" ? "p-5" : "p-6"
            )}>
              <Button 
                variant="outline" 
                onClick={() => setShowNewFamilyModal(false)} 
                className={cn(
                  "flex-1 bg-gray-50/80 hover:bg-gray-100/80 border-gray-200/80 text-gray-700",
                  "rounded-2xl shadow-sm active:scale-95 transition-all duration-200",
                  deviceType === "mobile" ? "h-10 text-sm" : "h-11 text-base"
                )}
              >
                取消
              </Button>
              <Button 
                onClick={handleSubmitNewFamily} 
                className={cn(
                  "flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
                  "text-white border-0 rounded-2xl shadow-lg active:scale-95 transition-all duration-200",
                  "hover:shadow-xl focus:ring-4 focus:ring-blue-200/50",
                  deviceType === "mobile" ? "h-10 text-sm" : "h-11 text-base"
                )}
              >
                创建家庭档案
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
