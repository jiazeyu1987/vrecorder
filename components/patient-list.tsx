"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDeviceType } from "@/hooks/use-wechat-responsive"
import { useIsMobile } from "@/hooks/use-mobile"
import { WechatPatientHeader } from "@/components/wechat-patient-header"
import { usePatientData } from "@/hooks/use-patient-data"
import { toast } from "sonner"
import type { CreateFamilyRequest, CreateMemberRequest, ServicePackage } from "@/lib/api"
import { getSystemDefaultPackages } from "@/lib/api"
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
  Settings,
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

export function PatientList() {
  const [searchTerm, setSearchTerm] = useState("")
  const {
    families,
    selectedFamily,
    selectedPatient,
    loading,
    error,
    fetchFamilies,
    fetchFamilyDetail,
    createNewFamily,
    updateFamilyInfo,
    removeFamilyById,
    addMemberToFamily,
    updateMemberInfo,
    removeMemberFromFamily,
    setSelectedFamily,
    setSelectedPatient,
    clearError,
    refreshData,
  } = usePatientData()
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null)
  const [showNewFamilyModal, setShowNewFamilyModal] = useState(false)
  const [showNewRecordModal, setShowNewRecordModal] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [editingPatient, setEditingPatient] = useState(false)
  const [editingFamily, setEditingFamily] = useState(false)
  const [showFilterOptions, setShowFilterOptions] = useState(false)
  const deviceType = useDeviceType()
  const isMobile = useIsMobile()
  const [newFamily, setNewFamily] = useState<CreateFamilyRequest>({
    householdHead: "",
    address: "",
    phone: "",
    members: [
      {
        name: "",
        age: 0,
        gender: "",
        relationship: "户主",
        conditions: "",
        packageType: "",
      },
    ],
  })
  const [editedPatientData, setEditedPatientData] = useState<Partial<FamilyMember>>({})
  const [editedFamilyData, setEditedFamilyData] = useState<Partial<CreateFamilyRequest>>({})
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null)
  const [editedMemberData, setEditedMemberData] = useState<Partial<FamilyMember>>({})
  const [newMember, setNewMember] = useState<Partial<CreateMemberRequest>>({
    name: "",
    age: 0,
    gender: "",
    relationship: "",
    conditions: "",
    packageType: "",
    paymentStatus: "normal",
    phone: "",
    medications: ""
  })
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
  
  // 服务套餐状态
  const [servicePackages, setServicePackages] = useState<ServicePackage[]>([])
  const [loadingPackages, setLoadingPackages] = useState(true)
  
  // 加载服务套餐数据
  useEffect(() => {
    const loadServicePackages = async () => {
      try {
        setLoadingPackages(true)
        const response = await getSystemDefaultPackages()
        if (response.code === 200) {
          setServicePackages(response.data)
        } else {
          console.error('Failed to load service packages:', response.message)
          toast.error('获取服务套餐失败')
        }
      } catch (error) {
        console.error('Error loading service packages:', error)
        toast.error('获取服务套餐失败')
      } finally {
        setLoadingPackages(false)
      }
    }
    
    loadServicePackages()
  }, [])

  // 设置默认套餐值
  useEffect(() => {
    if (servicePackages.length > 0) {
      const defaultPackage = servicePackages[0].name
      
      // 更新新家庭成员默认套餐
      setNewFamily(prev => ({
        ...prev,
        members: prev.members.map(member => 
          member.packageType === "" ? { ...member, packageType: defaultPackage } : member
        )
      }))
      
      // 更新新成员默认套餐
      setNewMember(prev => 
        prev.packageType === "" ? { ...prev, packageType: defaultPackage } : prev
      )
    }
  }, [servicePackages])

  const addFamilyMember = () => {
    const defaultPackage = servicePackages.length > 0 ? servicePackages[0].name : ""
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
          packageType: defaultPackage,
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

  const updateFamilyMember = (index: number, field: string, value: string | number) => {
    setNewFamily((prev) => ({
      ...prev,
      members: prev.members.map((member, i) => 
        i === index ? { ...member, [field]: field === 'age' ? Number(value) || 0 : value } : member
      ),
    }))
  }

  const handleSubmitNewFamily = async () => {
    try {
      // 验证表单数据
      if (!newFamily.householdHead || !newFamily.address || !newFamily.phone) {
        toast.error('请填写完整的家庭基本信息')
        return
      }

      for (const member of newFamily.members) {
        if (!member.name || !member.age || !member.gender || !member.relationship) {
          toast.error('请填写完整的家庭成员信息')
          return
        }
      }

      await createNewFamily(newFamily)
      toast.success('家庭档案创建成功！')
      setShowNewFamilyModal(false)
      resetNewFamilyForm()
    } catch (error) {
      console.error('创建家庭档案失败:', error)
      toast.error(error instanceof Error ? error.message : '创建失败，请重试')
    }
  }

  const resetNewFamilyForm = () => {
    setNewFamily({
      householdHead: "",
      address: "",
      phone: "",
      members: [
        {
          name: "",
          age: 0,
          gender: "",
          relationship: "户主",
          conditions: "",
          packageType: servicePackages.length > 0 ? servicePackages[0].name : "",
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

  const handleEditPatient = async () => {
    if (editingPatient && selectedPatient && selectedFamily) {
      try {
        // 构造更新数据
        const updateData: Partial<CreateMemberRequest> = {
          name: editedPatientData.name,
          age: editedPatientData.age,
          gender: editedPatientData.gender,
          packageType: editedPatientData.packageType,
          conditions: Array.isArray(editedPatientData.conditions) 
            ? editedPatientData.conditions.join(', ')
            : editedPatientData.conditions || '',
          medications: Array.isArray(editedPatientData.medications)
            ? editedPatientData.medications.join(', ')
            : editedPatientData.medications || '',
        }

        await updateMemberInfo(selectedFamily.id, selectedPatient.id, updateData)
        toast.success('患者信息更新成功！')
        setEditingPatient(false)
        setEditedPatientData({})
      } catch (error) {
        console.error('更新患者信息失败:', error)
        toast.error(error instanceof Error ? error.message : '更新失败，请重试')
      }
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

  // 家庭编辑相关函数
  const handleEditFamily = async () => {
    console.log("handleEditFamily called, editingFamily:", editingFamily)
    
    if (editingFamily && selectedFamily) {
      try {
        console.log("保存家庭信息, editedFamilyData:", editedFamilyData)
        
        // 构造更新数据，只包含被修改的字段
        const updateData: Partial<CreateFamilyRequest> = {}
        
        if (editedFamilyData.householdHead !== undefined) {
          updateData.householdHead = editedFamilyData.householdHead
        }
        if (editedFamilyData.address !== undefined) {
          updateData.address = editedFamilyData.address  
        }
        if (editedFamilyData.phone !== undefined) {
          updateData.phone = editedFamilyData.phone
        }

        console.log("发送更新请求, updateData:", updateData)
        await updateFamilyInfo(selectedFamily.id, updateData)
        
        toast.success('家庭信息更新成功！')
        console.log("家庭信息更新成功")
        
        setEditingFamily(false)
        setEditedFamilyData({})
        
        // 刷新数据以显示最新信息
        await refreshData()
        
      } catch (error) {
        console.error('更新家庭信息失败:', error)
        toast.error(error instanceof Error ? error.message : '更新失败，请重试')
      }
    } else {
      // 开始编辑模式
      console.log("开始编辑家庭信息")
      setEditingFamily(true)
      
      if (selectedFamily) {
        setEditedFamilyData({
          householdHead: selectedFamily.householdHead,
          address: selectedFamily.address,
          phone: selectedFamily.phone,
        })
        console.log("初始化编辑数据:", {
          householdHead: selectedFamily.householdHead,
          address: selectedFamily.address,
          phone: selectedFamily.phone,
        })
      }
    }
  }

  const updateEditedFamilyData = (field: string, value: any) => {
    console.log(`更新家庭字段 ${field}:`, value)
    setEditedFamilyData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const cancelFamilyEditing = () => {
    console.log("取消家庭编辑")
    setEditingFamily(false)
    setEditedFamilyData({})
  }

  // 成员编辑相关函数
  const handleEditMember = async (member: FamilyMember) => {
    console.log("开始编辑成员:", member)
    if (editingMemberId === member.id.toString() && selectedFamily) {
      try {
        console.log("保存成员信息, editedMemberData:", editedMemberData)
        
        const updateData: Partial<CreateMemberRequest> = {}
        
        if (editedMemberData.name !== undefined) {
          updateData.name = editedMemberData.name
        }
        if (editedMemberData.age !== undefined) {
          updateData.age = editedMemberData.age
        }
        if (editedMemberData.gender !== undefined) {
          updateData.gender = editedMemberData.gender
        }
        if (editedMemberData.relationship !== undefined) {
          updateData.relationship = editedMemberData.relationship
        }
        if (editedMemberData.packageType !== undefined) {
          updateData.packageType = editedMemberData.packageType
        }
        if (editedMemberData.paymentStatus !== undefined) {
          updateData.paymentStatus = editedMemberData.paymentStatus
        }
        if (editedMemberData.phone !== undefined) {
          updateData.phone = editedMemberData.phone
        }
        if (editedMemberData.conditions !== undefined) {
          updateData.conditions = Array.isArray(editedMemberData.conditions) 
            ? editedMemberData.conditions.join(', ')
            : editedMemberData.conditions || ''
        }
        if (editedMemberData.medications !== undefined) {
          updateData.medications = Array.isArray(editedMemberData.medications)
            ? editedMemberData.medications.join(', ')
            : editedMemberData.medications || ''
        }

        console.log("发送成员更新请求, updateData:", updateData)
        await updateMemberInfo(selectedFamily.id, member.id.toString(), updateData)
        
        toast.success('成员信息更新成功！')
        console.log("成员信息更新成功")
        
        setEditingMemberId(null)
        setEditedMemberData({})
        
        // 刷新数据
        await refreshData()
        
      } catch (error) {
        console.error('更新成员信息失败:', error)
        toast.error(error instanceof Error ? error.message : '更新失败，请重试')
      }
    } else {
      // 开始编辑模式
      console.log("开始编辑成员信息, member.id:", member.id)
      setEditingMemberId(member.id.toString())
      
      setEditedMemberData({
        name: member.name,
        age: member.age,
        gender: member.gender,
        relationship: member.relationship,
        packageType: member.packageType,
        paymentStatus: member.paymentStatus,
        phone: member.phone,
        conditions: member.conditions,
        medications: member.medications,
      })
      console.log("初始化编辑数据:", editedMemberData)
    }
  }

  const updateEditedMemberData = (field: string, value: any) => {
    console.log(`更新成员字段 ${field}:`, value)
    setEditedMemberData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const cancelMemberEditing = () => {
    console.log("取消成员编辑")
    setEditingMemberId(null)
    setEditedMemberData({})
  }

  const handleAddNewMember = async () => {
    if (!selectedFamily) return
    
    try {
      console.log("添加新成员:", newMember)
      
      // 验证必填字段
      if (!newMember.name || !newMember.age || !newMember.gender || !newMember.relationship) {
        toast.error('请填写完整的成员信息')
        return
      }

      await addMemberToFamily(selectedFamily.id, newMember)
      toast.success('成员添加成功！')
      console.log("成员添加成功")
      
      // 重置表单
      setNewMember({
        name: "",
        age: 0,
        gender: "",
        relationship: "",
        conditions: "",
        packageType: servicePackages.length > 0 ? servicePackages[0].name : "",
        paymentStatus: "normal",
        phone: "",
        medications: ""
      })
      
      // 刷新数据
      await refreshData()
      
    } catch (error) {
      console.error('添加成员失败:', error)
      toast.error(error instanceof Error ? error.message : '添加失败，请重试')
    }
  }

  const handleDeleteMember = async (member: FamilyMember) => {
    if (!selectedFamily) return
    
    // 确认删除
    if (!confirm(`确定要删除成员 ${member.name} 吗？此操作不可恢复。`)) {
      return
    }
    
    try {
      console.log("删除成员:", member)
      await removeMemberFromFamily(selectedFamily.id, member.id.toString())
      toast.success('成员删除成功！')
      console.log("成员删除成功")
      
      // 刷新数据
      await refreshData()
      
    } catch (error) {
      console.error('删除成员失败:', error)
      toast.error(error instanceof Error ? error.message : '删除失败，请重试')
    }
  }

  const updateNewMember = (field: string, value: any) => {
    setNewMember((prev) => ({
      ...prev,
      [field]: value,
    }))
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

  // 过滤搜索逻辑（现在在服务器端处理）
  const filteredFamilies = families.filter(
    (family) =>
      family.householdHead.toLowerCase().includes(searchTerm.toLowerCase()) ||
      family.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      family.members.some((member) => member.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // 监听搜索词变化，调用API搜索
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '') {
        fetchFamilies(1, 20, searchTerm)
      } else {
        fetchFamilies(1, 20, '')
      }
    }, 500) // 防抖处理

    return () => clearTimeout(timeoutId)
  }, [searchTerm, fetchFamilies])

  // 错误提示
  useEffect(() => {
    if (error) {
      toast.error(error)
      clearError()
    }
  }, [error, clearError])

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
                      {loadingPackages ? (
                        <SelectItem value="" disabled>加载中...</SelectItem>
                      ) : (
                        servicePackages.map((pkg) => (
                          <SelectItem key={pkg.id} value={pkg.name}>
                            {pkg.name} - ¥{pkg.price}/月
                          </SelectItem>
                        ))
                      )}
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
      <div className={cn(
        "min-h-screen bg-gradient-to-br from-gray-50/80 via-blue-50/40 to-indigo-50/30",
        "selection:bg-blue-200 selection:text-blue-900", // 改善文字选择体验
        deviceType === "mobile" ? "px-3 py-4" : deviceType === "tablet" ? "px-4 py-5" : "px-6 py-6 max-w-4xl mx-auto"
      )}>
        {/* 微信小程序风格的顶部导航 - 家庭档案专用 */}
        <div className={cn(
          "flex items-center gap-3 mb-6 px-1 relative",
          "before:absolute before:inset-0 before:bg-white/60 before:backdrop-blur-md before:rounded-2xl before:-z-10",
          "before:shadow-lg before:border before:border-white/30",
          deviceType === "mobile" ? "py-3" : "py-2"
        )}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedFamily(null)}
            className={cn(
              "rounded-full hover:bg-white/90 active:scale-95 transition-all duration-200",
              "bg-white/80 backdrop-blur-md shadow-lg border border-white/40",
              "hover:shadow-xl group relative overflow-hidden",
              deviceType === "mobile" ? "h-10 w-10" : "h-9 w-9"
            )}
            aria-label="返回患者列表"
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
            )}>{editingFamily ? (
              <Input
                value={editedFamilyData.householdHead || ''}
                onChange={(e) => updateEditedFamilyData('householdHead', e.target.value)}
                className="border-blue-200 bg-blue-50/30 rounded-lg focus:bg-white text-lg font-semibold"
                placeholder="户主姓名"
              />
            ) : `${selectedFamily.householdHead}家`}</h1>
            <p className={cn(
              "text-gray-600",
              deviceType === "mobile" ? "text-sm" : "text-xs"
            )}>家庭档案管理</p>
          </div>
          <div className="flex gap-2">
            {editingFamily && (
              <Button 
                variant="outline" 
                size="sm"
                className={cn(
                  "bg-gray-500/10 hover:bg-gray-500/20 border-gray-200 text-gray-700",
                  "rounded-xl shadow-md backdrop-blur-sm active:scale-95 transition-all duration-200",
                  deviceType === "mobile" ? "px-3 py-2 text-xs gap-1" : "px-2 py-1.5 text-xs gap-1"
                )}
                onClick={cancelFamilyEditing}
              >
                <X className={cn(
                  deviceType === "mobile" ? "h-3.5 w-3.5" : "h-3 w-3"
                )} />
                取消
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              className={cn(
                editingFamily ? "bg-green-500/10 hover:bg-green-500/20 border-green-200 text-green-700" : "bg-blue-500/10 hover:bg-blue-500/20 border-blue-200 text-blue-700",
                "rounded-xl shadow-md backdrop-blur-sm active:scale-95 transition-all duration-200",
                deviceType === "mobile" ? "px-3 py-2 text-xs gap-1" : "px-2 py-1.5 text-xs gap-1"
              )}
              onClick={handleEditFamily}
            >
              <Edit className={cn(
                deviceType === "mobile" ? "h-3.5 w-3.5" : "h-3 w-3"
              )} />
              {editingFamily ? "保存" : "编辑"}
            </Button>
          </div>
        </div>

        {/* 微信小程序风格的家庭信息卡片 */}
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
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-gray-800">家庭基本信息</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 微信小程序信息项目 */}
            <div className="bg-gray-50/60 rounded-2xl p-3 space-y-3 border border-gray-100/80">
              <div className="flex items-center gap-3 group/item hover:bg-white/70 rounded-xl p-2 -m-2 transition-all duration-150">
                <div className="bg-blue-100/70 hover:bg-blue-200/60 transition-colors duration-150 p-1.5 rounded-lg group-hover/item:scale-105 transform transition-transform duration-150">
                  <MapPin className={cn(
                    "text-blue-600",
                    deviceType === "mobile" ? "h-3.5 w-3.5" : "h-3 w-3"
                  )} />
                </div>
                <div className="flex-1">
                  <p className={cn(
                    "text-gray-500 font-medium mb-0.5",
                    deviceType === "mobile" ? "text-xs" : "text-[10px]"
                  )}>家庭地址</p>
                  {editingFamily ? (
                    <Input
                      value={editedFamilyData.address || ''}
                      onChange={(e) => updateEditedFamilyData('address', e.target.value)}
                      className="border-blue-200 bg-blue-50/30 rounded-lg focus:bg-white text-sm"
                      placeholder="家庭地址"
                    />
                  ) : (
                    <p className={cn(
                      "text-gray-800 font-medium",
                      deviceType === "mobile" ? "text-sm leading-relaxed" : "text-xs leading-relaxed"
                    )}>{selectedFamily.address}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3 group/item hover:bg-white/70 rounded-xl p-2 -m-2 transition-all duration-150">
                <div className="bg-green-100/70 hover:bg-green-200/60 transition-colors duration-150 p-1.5 rounded-lg group-hover/item:scale-105 transform transition-transform duration-150">
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
                  {editingFamily ? (
                    <Input
                      value={editedFamilyData.phone || ''}
                      onChange={(e) => updateEditedFamilyData('phone', e.target.value)}
                      className="border-blue-200 bg-blue-50/30 rounded-lg focus:bg-white text-sm"
                      placeholder="联系电话"
                    />
                  ) : (
                    <p className={cn(
                      "text-gray-800 font-medium",
                      deviceType === "mobile" ? "text-sm" : "text-xs"
                    )}>{selectedFamily.phone}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3 group/item hover:bg-white/70 rounded-xl p-2 -m-2 transition-all duration-150">
                <div className="bg-purple-100/70 hover:bg-purple-200/60 transition-colors duration-150 p-1.5 rounded-lg group-hover/item:scale-105 transform transition-transform duration-150">
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
                  )}>{selectedFamily.lastService}</p>
                </div>
              </div>
            </div>

            {/* 微信小程序风格的统计信息 */}
            <div className="pt-3 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center bg-blue-50/60 rounded-xl p-3 border border-blue-100/60">
                  <p className={cn(
                    "font-bold text-blue-600 mb-1",
                    deviceType === "mobile" ? "text-lg" : "text-base"
                  )}>{selectedFamily.totalMembers}</p>
                  <p className={cn(
                    "text-gray-600 font-medium",
                    deviceType === "mobile" ? "text-xs" : "text-[10px]"
                  )}>家庭成员</p>
                </div>
                <div className="text-center bg-green-50/60 rounded-xl p-3 border border-green-100/60">
                  <p className={cn(
                    "font-bold text-green-600 mb-1",
                    deviceType === "mobile" ? "text-lg" : "text-base"
                  )}>{allFamilyRecords.length}</p>
                  <p className={cn(
                    "text-gray-600 font-medium",
                    deviceType === "mobile" ? "text-xs" : "text-[10px]"
                  )}>健康记录</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 家庭编辑模式提示 */}
        {editingFamily && (
          <Card className="shadow-sm border-blue-200 bg-blue-50/50 mb-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-blue-700">
                <Edit className="h-4 w-4" />
                <span className="text-sm font-medium">家庭信息编辑模式</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">修改完成后请点击"保存"按钮保存更改，或点击"取消"放弃修改</p>
            </CardContent>
          </Card>
        )}

        {/* 微信小程序风格的家庭成员卡片 */}
        <Card className={cn(
          "shadow-xl border-0 bg-white/98 backdrop-blur-xl rounded-3xl mb-4",
          "border border-white/30 relative overflow-hidden",
          "before:absolute before:inset-0 before:bg-gradient-to-br before:from-green-50/30 before:to-emerald-50/20 before:-z-10"
        )}>
          <CardHeader className="pb-3">
            <CardTitle className={cn(
              "flex items-center justify-between",
              deviceType === "mobile" ? "text-base" : "text-sm"
            )}>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-green-500/10 rounded-full">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-gray-800">家庭成员</span>
              </div>
              <Badge variant="secondary" className={cn(
                "bg-green-100/70 text-green-700 border-green-200/40 rounded-full",
                deviceType === "mobile" ? "text-xs px-2 py-0.5" : "text-[10px] px-1.5 py-0.5"
              )}>
                {selectedFamily.totalMembers}人
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-3">
              {selectedFamily.members.map((member) => (
                <div key={member.id} className={cn(
                  "group bg-gray-50/80 rounded-2xl border border-gray-100/80 transition-all duration-200",
                  "hover:bg-white hover:border-gray-200/90 hover:shadow-lg cursor-pointer",
                  "active:scale-[0.99] transform overflow-hidden",
                  deviceType === "mobile" ? "p-4" : "p-3"
                )}>
                  {/* 成员头部信息 */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-500 p-2 rounded-xl group-hover:scale-105 transition-transform duration-200">
                        <User className={cn(
                          "text-white",
                          deviceType === "mobile" ? "h-4 w-4" : "h-3.5 w-3.5"
                        )} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            "font-bold text-gray-900",
                            deviceType === "mobile" ? "text-base" : "text-sm"
                          )}>{member.name}</span>
                          <Badge variant="outline" className={cn(
                            "bg-blue-50/60 text-blue-700 border-blue-200/40 rounded-full",
                            deviceType === "mobile" ? "text-xs px-2 py-0.5" : "text-[10px] px-1.5 py-0.5"
                          )}>
                            {member.relationship}
                          </Badge>
                        </div>
                        <p className={cn(
                          "text-gray-600 font-medium",
                          deviceType === "mobile" ? "text-sm" : "text-xs"
                        )}>{member.age}岁 · {member.gender}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn(
                      getPaymentStatusColor(member.paymentStatus),
                      "rounded-full font-medium border-0 shadow-sm",
                      deviceType === "mobile" ? "text-xs px-2.5 py-1" : "text-[10px] px-2 py-0.5"
                    )}>
                      {getPaymentStatusText(member.paymentStatus)}
                    </Badge>
                  </div>

                  {/* 成员详细信息 */}
                  <div className="bg-white/60 rounded-xl p-3 space-y-2 border border-gray-100/60">
                    {/* 健康状况 */}
                    <div className="flex items-start gap-2">
                      <div className="bg-red-100/70 p-1 rounded-lg mt-0.5">
                        <Heart className={cn(
                          "text-red-500",
                          deviceType === "mobile" ? "h-3 w-3" : "h-2.5 w-2.5"
                        )} />
                      </div>
                      <div className="flex-1">
                        <p className={cn(
                          "text-gray-600 font-medium mb-1",
                          deviceType === "mobile" ? "text-xs" : "text-[10px]"
                        )}>健康状况</p>
                        <div className="flex gap-1 flex-wrap">
                          {member.conditions.map((condition, index) => (
                            <Badge key={index} 
                              variant="secondary" 
                              className={cn(
                                "bg-red-50/80 text-red-700 border border-red-200/60 rounded-lg",
                                deviceType === "mobile" ? "text-[10px] px-1.5 py-0.5" : "text-[9px] px-1 py-0.5"
                              )}
                            >
                              {condition}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 用药情况 */}
                    {member.medications && (
                      <div className="flex items-start gap-2">
                        <div className="bg-blue-100/70 p-1 rounded-lg mt-0.5">
                          <Pill className={cn(
                            "text-blue-500",
                            deviceType === "mobile" ? "h-3 w-3" : "h-2.5 w-2.5"
                          )} />
                        </div>
                        <div className="flex-1">
                          <p className={cn(
                            "text-gray-600 font-medium mb-1",
                            deviceType === "mobile" ? "text-xs" : "text-[10px]"
                          )}>用药情况</p>
                          <div className="flex gap-1 flex-wrap">
                            {member.medications.map((medication, index) => (
                              <Badge key={index} 
                                variant="outline" 
                                className={cn(
                                  "bg-blue-50/80 text-blue-700 border border-blue-200/60 rounded-lg",
                                  deviceType === "mobile" ? "text-[10px] px-1.5 py-0.5" : "text-[9px] px-1 py-0.5"
                                )}
                              >
                                {medication}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 服务信息 */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                      <div className="text-center">
                        <p className={cn(
                          "text-gray-500 font-medium mb-0.5",
                          deviceType === "mobile" ? "text-[10px]" : "text-[9px]"
                        )}>最近服务</p>
                        <p className={cn(
                          "text-gray-800 font-semibold",
                          deviceType === "mobile" ? "text-xs" : "text-[10px]"
                        )}>{member.lastService}</p>
                      </div>
                      <div className="text-center">
                        <p className={cn(
                          "text-gray-500 font-medium mb-0.5",
                          deviceType === "mobile" ? "text-[10px]" : "text-[9px]"
                        )}>套餐类型</p>
                        <p className={cn(
                          "text-gray-800 font-semibold",
                          deviceType === "mobile" ? "text-xs" : "text-[10px]"
                        )}>{member.packageType}</p>
                      </div>
                    </div>
                  </div>

                  {/* 成员操作按钮 */}
                  <div className="flex gap-2 pt-3">
                    {editingFamily ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className={cn(
                            editingMemberId === member.id.toString() 
                              ? "flex-1 bg-green-50/60 hover:bg-green-100/60 border-green-200/60 text-green-700"
                              : "flex-1 bg-blue-50/60 hover:bg-blue-100/60 border-blue-200/60 text-blue-700",
                            "rounded-xl transition-all duration-150 active:scale-95",
                            deviceType === "mobile" ? "h-8 text-xs" : "h-7 text-[10px]"
                          )}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditMember(member)
                          }}
                        >
                          <Edit className={cn(
                            deviceType === "mobile" ? "h-3 w-3 mr-1" : "h-2.5 w-2.5 mr-1"
                          )} />
                          {editingMemberId === member.id.toString() ? "保存" : "编辑"}
                        </Button>
                        {editingMemberId === member.id.toString() && (
                          <Button
                            size="sm"
                            variant="outline"
                            className={cn(
                              "bg-gray-50/60 hover:bg-gray-100/60 border-gray-200/60 text-gray-700",
                              "rounded-xl transition-all duration-150 active:scale-95",
                              deviceType === "mobile" ? "h-8 text-xs px-3" : "h-7 text-[10px] px-2"
                            )}
                            onClick={(e) => {
                              e.stopPropagation()
                              cancelMemberEditing()
                            }}
                          >
                            <X className={cn(
                              deviceType === "mobile" ? "h-3 w-3" : "h-2.5 w-2.5"
                            )} />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className={cn(
                            "bg-red-50/60 hover:bg-red-100/60 border-red-200/60 text-red-700",
                            "rounded-xl transition-all duration-150 active:scale-95",
                            deviceType === "mobile" ? "h-8 text-xs px-3" : "h-7 text-[10px] px-2"
                          )}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteMember(member)
                          }}
                        >
                          <Trash2 className={cn(
                            deviceType === "mobile" ? "h-3 w-3" : "h-2.5 w-2.5"
                          )} />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className={cn(
                            "flex-1 bg-blue-50/60 hover:bg-blue-100/60 border-blue-200/60 text-blue-700",
                            "rounded-xl transition-all duration-150 active:scale-95",
                            deviceType === "mobile" ? "h-8 text-xs" : "h-7 text-[10px]"
                          )}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedPatient(member)
                          }}
                        >
                          查看详情
                        </Button>
                        {member.paymentStatus === "overdue" && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className={cn(
                              "bg-orange-50/60 hover:bg-orange-100/60 border-orange-200/60 text-orange-700",
                              "rounded-xl transition-all duration-150 active:scale-95",
                              deviceType === "mobile" ? "h-8 text-xs px-3" : "h-7 text-[10px] px-2"
                            )}
                            onClick={(e) => {
                              e.stopPropagation()
                              // 添加催缴逻辑
                            }}
                          >
                            催缴
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 添加新成员按钮 */}
            {editingFamily && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  className={cn(
                    "w-full bg-green-50/60 hover:bg-green-100/60 border-green-200/60 text-green-700",
                    "rounded-xl border-2 border-dashed transition-all duration-200",
                    deviceType === "mobile" ? "h-10 text-sm" : "h-9 text-xs"
                  )}
                  onClick={handleAddNewMember}
                >
                  <Plus className={cn(
                    "mr-2",
                    deviceType === "mobile" ? "h-4 w-4" : "h-3.5 w-3.5"
                  )} />
                  添加新成员
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 成员编辑表单 */}
        {editingFamily && editingMemberId && (
          <Card className="shadow-sm border-blue-200 bg-blue-50/50 mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-blue-700 flex items-center gap-2">
                <Edit className="h-4 w-4" />
                <span className="text-sm font-medium">编辑成员信息</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">姓名</Label>
                  <Input
                    value={editedMemberData.name || ""}
                    onChange={(e) => updateEditedMemberData("name", e.target.value)}
                    className="border-blue-200 bg-blue-50/30 rounded-lg focus:bg-white"
                    placeholder="成员姓名"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">年龄</Label>
                  <Input
                    value={editedMemberData.age?.toString() || ""}
                    onChange={(e) => updateEditedMemberData("age", parseInt(e.target.value) || 0)}
                    type="number"
                    className="border-blue-200 bg-blue-50/30 rounded-lg focus:bg-white"
                    placeholder="年龄"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">性别</Label>
                  <Select
                    value={editedMemberData.gender || ""}
                    onValueChange={(value) => updateEditedMemberData("gender", value)}
                  >
                    <SelectTrigger className="border-blue-200 bg-blue-50/30 rounded-lg focus:bg-white">
                      <SelectValue placeholder="选择性别" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="男">男</SelectItem>
                      <SelectItem value="女">女</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">关系</Label>
                  <Select
                    value={editedMemberData.relationship || ""}
                    onValueChange={(value) => updateEditedMemberData("relationship", value)}
                  >
                    <SelectTrigger className="border-blue-200 bg-blue-50/30 rounded-lg focus:bg-white">
                      <SelectValue placeholder="选择关系" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="户主">户主</SelectItem>
                      <SelectItem value="配偶">配偶</SelectItem>
                      <SelectItem value="儿子">儿子</SelectItem>
                      <SelectItem value="女儿">女儿</SelectItem>
                      <SelectItem value="父亲">父亲</SelectItem>
                      <SelectItem value="母亲">母亲</SelectItem>
                      <SelectItem value="其他">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">套餐类型</Label>
                  <Select
                    value={editedMemberData.packageType || ""}
                    onValueChange={(value) => updateEditedMemberData("packageType", value)}
                  >
                    <SelectTrigger className="border-blue-200 bg-blue-50/30 rounded-lg focus:bg-white">
                      <SelectValue placeholder="选择套餐" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingPackages ? (
                        <SelectItem value="" disabled>加载中...</SelectItem>
                      ) : (
                        servicePackages.map((pkg) => (
                          <SelectItem key={pkg.id} value={pkg.name}>
                            {pkg.name} - ¥{pkg.price}/月
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">支付状态</Label>
                  <Select
                    value={editedMemberData.paymentStatus || ""}
                    onValueChange={(value) => updateEditedMemberData("paymentStatus", value)}
                  >
                    <SelectTrigger className="border-blue-200 bg-blue-50/30 rounded-lg focus:bg-white">
                      <SelectValue placeholder="选择状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">正常</SelectItem>
                      <SelectItem value="overdue">欠费</SelectItem>
                      <SelectItem value="suspended">暂停</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-600">手机号码</Label>
                <Input
                  value={editedMemberData.phone || ""}
                  onChange={(e) => updateEditedMemberData("phone", e.target.value)}
                  className="border-blue-200 bg-blue-50/30 rounded-lg focus:bg-white"
                  placeholder="手机号码"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-600">健康状况</Label>
                <Input
                  value={Array.isArray(editedMemberData.conditions) 
                    ? editedMemberData.conditions.join(', ') 
                    : editedMemberData.conditions || ""}
                  onChange={(e) => updateEditedMemberData("conditions", e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                  className="border-blue-200 bg-blue-50/30 rounded-lg focus:bg-white"
                  placeholder="健康状况，多个用逗号分隔"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-600">用药情况</Label>
                <Input
                  value={Array.isArray(editedMemberData.medications) 
                    ? editedMemberData.medications.join(', ') 
                    : editedMemberData.medications || ""}
                  onChange={(e) => updateEditedMemberData("medications", e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                  className="border-blue-200 bg-blue-50/30 rounded-lg focus:bg-white"
                  placeholder="用药情况，多个用逗号分隔"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* 添加新成员表单 */}
        {editingFamily && (
          <Card className="shadow-sm border-green-200 bg-green-50/50 mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-green-700 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span className="text-sm font-medium">添加新成员</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">姓名 *</Label>
                  <Input
                    value={newMember.name || ""}
                    onChange={(e) => updateNewMember("name", e.target.value)}
                    className="border-green-200 bg-green-50/30 rounded-lg focus:bg-white"
                    placeholder="成员姓名"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">年龄 *</Label>
                  <Input
                    value={newMember.age?.toString() || ""}
                    onChange={(e) => updateNewMember("age", parseInt(e.target.value) || 0)}
                    type="number"
                    className="border-green-200 bg-green-50/30 rounded-lg focus:bg-white"
                    placeholder="年龄"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">性别 *</Label>
                  <Select
                    value={newMember.gender || ""}
                    onValueChange={(value) => updateNewMember("gender", value)}
                  >
                    <SelectTrigger className="border-green-200 bg-green-50/30 rounded-lg focus:bg-white">
                      <SelectValue placeholder="选择性别" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="男">男</SelectItem>
                      <SelectItem value="女">女</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">关系 *</Label>
                  <Select
                    value={newMember.relationship || ""}
                    onValueChange={(value) => updateNewMember("relationship", value)}
                  >
                    <SelectTrigger className="border-green-200 bg-green-50/30 rounded-lg focus:bg-white">
                      <SelectValue placeholder="选择关系" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="户主">户主</SelectItem>
                      <SelectItem value="配偶">配偶</SelectItem>
                      <SelectItem value="儿子">儿子</SelectItem>
                      <SelectItem value="女儿">女儿</SelectItem>
                      <SelectItem value="父亲">父亲</SelectItem>
                      <SelectItem value="母亲">母亲</SelectItem>
                      <SelectItem value="其他">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">套餐类型</Label>
                  <Select
                    value={newMember.packageType || (servicePackages.length > 0 ? servicePackages[0].name : "")}
                    onValueChange={(value) => updateNewMember("packageType", value)}
                  >
                    <SelectTrigger className="border-green-200 bg-green-50/30 rounded-lg focus:bg-white">
                      <SelectValue placeholder="选择套餐" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingPackages ? (
                        <SelectItem value="" disabled>加载中...</SelectItem>
                      ) : (
                        servicePackages.map((pkg) => (
                          <SelectItem key={pkg.id} value={pkg.name}>
                            {pkg.name} - ¥{pkg.price}/月
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">支付状态</Label>
                  <Select
                    value={newMember.paymentStatus || "normal"}
                    onValueChange={(value) => updateNewMember("paymentStatus", value)}
                  >
                    <SelectTrigger className="border-green-200 bg-green-50/30 rounded-lg focus:bg-white">
                      <SelectValue placeholder="选择状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">正常</SelectItem>
                      <SelectItem value="overdue">欠费</SelectItem>
                      <SelectItem value="suspended">暂停</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-600">手机号码</Label>
                <Input
                  value={newMember.phone || ""}
                  onChange={(e) => updateNewMember("phone", e.target.value)}
                  className="border-green-200 bg-green-50/30 rounded-lg focus:bg-white"
                  placeholder="手机号码"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-600">健康状况</Label>
                <Input
                  value={newMember.conditions || ""}
                  onChange={(e) => updateNewMember("conditions", e.target.value)}
                  className="border-green-200 bg-green-50/30 rounded-lg focus:bg-white"
                  placeholder="健康状况，多个用逗号分隔"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-600">用药情况</Label>
                <Input
                  value={newMember.medications || ""}
                  onChange={(e) => updateNewMember("medications", e.target.value)}
                  className="border-green-200 bg-green-50/30 rounded-lg focus:bg-white"
                  placeholder="用药情况，多个用逗号分隔"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleAddNewMember}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  添加成员
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setNewMember({
                    name: "",
                    age: 0,
                    gender: "",
                    relationship: "",
                    conditions: "",
                    packageType: servicePackages.length > 0 ? servicePackages[0].name : "",
                    paymentStatus: "normal",
                    phone: "",
                    medications: ""
                  })}
                  className="px-4 border-green-200 text-green-700 hover:bg-green-50 rounded-lg"
                >
                  重置
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 微信小程序风格的家庭健康记录卡片 */}
        <Card className={cn(
          "shadow-xl border-0 bg-white/98 backdrop-blur-xl rounded-3xl mb-4",
          "border border-white/30 relative overflow-hidden",
          "before:absolute before:inset-0 before:bg-gradient-to-br before:from-purple-50/30 before:to-pink-50/20 before:-z-10"
        )}>
          <CardHeader className="pb-3">
            <CardTitle className={cn(
              "flex items-center justify-between",
              deviceType === "mobile" ? "text-base" : "text-sm"
            )}>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-purple-500/10 rounded-full">
                  <FileText className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-gray-800">家庭健康记录</span>
              </div>
              <Badge variant="secondary" className={cn(
                "bg-purple-100/70 text-purple-700 border-purple-200/40 rounded-full",
                deviceType === "mobile" ? "text-xs px-2 py-0.5" : "text-[10px] px-1.5 py-0.5"
              )}>
                {allFamilyRecords.length}条记录
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {allFamilyRecords.length > 0 ? (
              <div className={cn(
                "space-y-3 overflow-y-auto",
                deviceType === "mobile" ? "max-h-96" : "max-h-80"
              )}>
                {allFamilyRecords.map((record) => (
                  <div
                    key={`${record.patientId}-${record.id}`}
                    className={cn(
                      "group bg-white/90 rounded-2xl border border-purple-100/60 cursor-pointer",
                      "hover:shadow-lg hover:border-purple-200/80 transition-all duration-200",
                      "active:scale-[0.99] transform overflow-hidden",
                      deviceType === "mobile" ? "p-4" : "p-3"
                    )}
                    onClick={() => setSelectedRecord(record)}
                  >
                    {/* 记录头部 */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            "font-bold text-purple-800",
                            deviceType === "mobile" ? "text-sm" : "text-xs"
                          )}>{record.patientName}</span>
                          <Badge variant="outline" className={cn(
                            "bg-purple-50/80 text-purple-600 border-purple-200/60 rounded-full",
                            deviceType === "mobile" ? "text-[10px] px-1.5 py-0.5" : "text-[9px] px-1 py-0.5"
                          )}>
                            {record.serviceType}
                          </Badge>
                        </div>
                        <p className={cn(
                          "text-gray-600 font-medium",
                          deviceType === "mobile" ? "text-xs" : "text-[10px]"
                        )}>
                          {record.date} {record.time}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn(
                          getStatusColor(record.status),
                          "rounded-full border-0 shadow-sm",
                          deviceType === "mobile" ? "text-[10px] px-2 py-0.5" : "text-[9px] px-1.5 py-0.5"
                        )}>
                          {getStatusText(record.status)}
                        </Badge>
                        <div className="bg-purple-100/70 rounded-full p-1 group-hover:bg-purple-200/80 transition-colors duration-150">
                          <ChevronRight className={cn(
                            "text-purple-600",
                            deviceType === "mobile" ? "h-3 w-3" : "h-2.5 w-2.5"
                          )} />
                        </div>
                      </div>
                    </div>

                    {/* 记录内容预览 */}
                    <div className="bg-purple-50/40 rounded-xl p-3 mb-3 border border-purple-100/60">
                      <p className={cn(
                        "text-gray-700 line-clamp-2 leading-relaxed",
                        deviceType === "mobile" ? "text-xs" : "text-[10px]"
                      )}>{record.observations}</p>
                    </div>

                    {/* 记录附件统计 */}
                    <div className="flex items-center gap-4 text-gray-500">
                      {record.photos.length > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="bg-blue-100/70 p-1 rounded-lg">
                            <Camera className={cn(
                              "text-blue-600",
                              deviceType === "mobile" ? "h-3 w-3" : "h-2.5 w-2.5"
                            )} />
                          </div>
                          <span className={cn(
                            "font-medium",
                            deviceType === "mobile" ? "text-xs" : "text-[10px]"
                          )}>{record.photos.length}张照片</span>
                        </div>
                      )}
                      {record.audioNotes.length > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="bg-green-100/70 p-1 rounded-lg">
                            <Mic className={cn(
                              "text-green-600",
                              deviceType === "mobile" ? "h-3 w-3" : "h-2.5 w-2.5"
                            )} />
                          </div>
                          <span className={cn(
                            "font-medium",
                            deviceType === "mobile" ? "text-xs" : "text-[10px]"
                          )}>{record.audioNotes.length}条录音</span>
                        </div>
                      )}
                      {Object.keys(record.vitals).length > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="bg-red-100/70 p-1 rounded-lg">
                            <Activity className={cn(
                              "text-red-600",
                              deviceType === "mobile" ? "h-3 w-3" : "h-2.5 w-2.5"
                            )} />
                          </div>
                          <span className={cn(
                            "font-medium",
                            deviceType === "mobile" ? "text-xs" : "text-[10px]"
                          )}>{Object.keys(record.vitals).length}项体征</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className={cn(
                  "mx-auto mb-4 bg-purple-100/70 rounded-full flex items-center justify-center",
                  deviceType === "mobile" ? "w-16 h-16" : "w-12 h-12"
                )}>
                  <FileText className={cn(
                    "text-purple-400",
                    deviceType === "mobile" ? "h-8 w-8" : "h-6 w-6"
                  )} />
                </div>
                <h3 className={cn(
                  "font-medium text-gray-600 mb-2",
                  deviceType === "mobile" ? "text-base" : "text-sm"
                )}>暂无健康记录</h3>
                <p className={cn(
                  "text-gray-500",
                  deviceType === "mobile" ? "text-sm" : "text-xs"
                )}>请为家庭成员添加首个健康记录</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 微信小程序风格的家庭操作卡片 */}
        <Card className={cn(
          "shadow-xl border-0 bg-white/98 backdrop-blur-xl rounded-3xl mb-4",
          "border border-white/30 relative overflow-hidden",
          "before:absolute before:inset-0 before:bg-gradient-to-br before:from-indigo-50/30 before:to-blue-50/20 before:-z-10"
        )}>
          <CardHeader className="pb-3">
            <CardTitle className={cn(
              "flex items-center gap-3",
              deviceType === "mobile" ? "text-base" : "text-sm"
            )}>
              <div className="flex items-center justify-center w-8 h-8 bg-indigo-500/10 rounded-full">
                <Settings className="h-4 w-4 text-indigo-600" />
              </div>
              <span className="text-gray-800">家庭操作</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* 微信小程序风格的操作按钮网格 */}
            <div className="grid grid-cols-2 gap-3">
              {/* 查看付款记录 */}
              <Button 
                variant="outline" 
                className={cn(
                  "bg-gradient-to-br from-emerald-50/80 to-green-50/60 hover:from-emerald-100/80 hover:to-green-100/60",
                  "border-emerald-200/60 hover:border-emerald-300/80 text-emerald-700",
                  "rounded-2xl transition-all duration-200 active:scale-95 hover:shadow-lg",
                  "group relative overflow-hidden",
                  deviceType === "mobile" ? "h-auto py-4 px-3 flex-col gap-2" : "h-auto py-3 px-2 flex-col gap-1.5"
                )}
                onClick={() => {
                  // 添加查看付款记录逻辑
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <div className="bg-emerald-500/10 p-2 rounded-xl group-hover:scale-105 transition-transform duration-200">
                  <CreditCard className={cn(
                    "text-emerald-600",
                    deviceType === "mobile" ? "h-5 w-5" : "h-4 w-4"
                  )} />
                </div>
                <span className={cn(
                  "font-semibold text-center relative z-10",
                  deviceType === "mobile" ? "text-sm" : "text-xs"
                )}>付款记录</span>
              </Button>

              {/* 添加新成员 */}
              <Button 
                variant="outline" 
                className={cn(
                  "bg-gradient-to-br from-blue-50/80 to-indigo-50/60 hover:from-blue-100/80 hover:to-indigo-100/60",
                  "border-blue-200/60 hover:border-blue-300/80 text-blue-700",
                  "rounded-2xl transition-all duration-200 active:scale-95 hover:shadow-lg",
                  "group relative overflow-hidden",
                  deviceType === "mobile" ? "h-auto py-4 px-3 flex-col gap-2" : "h-auto py-3 px-2 flex-col gap-1.5"
                )}
                onClick={() => {
                  // 添加新成员逻辑
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <div className="bg-blue-500/10 p-2 rounded-xl group-hover:scale-105 transition-transform duration-200">
                  <UserPlus className={cn(
                    "text-blue-600",
                    deviceType === "mobile" ? "h-5 w-5" : "h-4 w-4"
                  )} />
                </div>
                <span className={cn(
                  "font-semibold text-center relative z-10",
                  deviceType === "mobile" ? "text-sm" : "text-xs"
                )}>添加成员</span>
              </Button>

              {/* 家庭预约 */}
              <Button 
                variant="outline" 
                className={cn(
                  "bg-gradient-to-br from-purple-50/80 to-pink-50/60 hover:from-purple-100/80 hover:to-pink-100/60",
                  "border-purple-200/60 hover:border-purple-300/80 text-purple-700",
                  "rounded-2xl transition-all duration-200 active:scale-95 hover:shadow-lg",
                  "group relative overflow-hidden",
                  deviceType === "mobile" ? "h-auto py-4 px-3 flex-col gap-2" : "h-auto py-3 px-2 flex-col gap-1.5"
                )}
                onClick={() => {
                  // 添加家庭预约逻辑
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <div className="bg-purple-500/10 p-2 rounded-xl group-hover:scale-105 transition-transform duration-200">
                  <Calendar className={cn(
                    "text-purple-600",
                    deviceType === "mobile" ? "h-5 w-5" : "h-4 w-4"
                  )} />
                </div>
                <span className={cn(
                  "font-semibold text-center relative z-10",
                  deviceType === "mobile" ? "text-sm" : "text-xs"
                )}>家庭预约</span>
              </Button>

              {/* 联系家庭 */}
              <Button 
                variant="outline" 
                className={cn(
                  "bg-gradient-to-br from-orange-50/80 to-yellow-50/60 hover:from-orange-100/80 hover:to-yellow-100/60",
                  "border-orange-200/60 hover:border-orange-300/80 text-orange-700",
                  "rounded-2xl transition-all duration-200 active:scale-95 hover:shadow-lg",
                  "group relative overflow-hidden",
                  deviceType === "mobile" ? "h-auto py-4 px-3 flex-col gap-2" : "h-auto py-3 px-2 flex-col gap-1.5"
                )}
                onClick={() => {
                  // 添加联系家庭逻辑
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <div className="bg-orange-500/10 p-2 rounded-xl group-hover:scale-105 transition-transform duration-200">
                  <MessageCircle className={cn(
                    "text-orange-600",
                    deviceType === "mobile" ? "h-5 w-5" : "h-4 w-4"
                  )} />
                </div>
                <span className={cn(
                  "font-semibold text-center relative z-10",
                  deviceType === "mobile" ? "text-sm" : "text-xs"
                )}>联系家庭</span>
              </Button>
            </div>

            {/* 微信小程序风格的快速操作区域 */}
            <div className="pt-3 border-t border-gray-100">
              <p className={cn(
                "text-gray-600 font-medium mb-3",
                deviceType === "mobile" ? "text-xs" : "text-[10px]"
              )}>快速操作</p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className={cn(
                    "flex-1 bg-gradient-to-r from-red-50/80 to-pink-50/60 hover:from-red-100/80 hover:to-pink-100/60",
                    "border-red-200/60 hover:border-red-300/80 text-red-700",
                    "rounded-xl transition-all duration-200 active:scale-95",
                    deviceType === "mobile" ? "h-9 text-xs gap-1.5" : "h-8 text-[10px] gap-1"
                  )}
                  onClick={() => {
                    // 添加紧急联系逻辑
                  }}
                >
                  <Phone className={cn(
                    deviceType === "mobile" ? "h-3.5 w-3.5" : "h-3 w-3"
                  )} />
                  紧急联系
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className={cn(
                    "flex-1 bg-gradient-to-r from-green-50/80 to-emerald-50/60 hover:from-green-100/80 hover:to-emerald-100/60",
                    "border-green-200/60 hover:border-green-300/80 text-green-700",
                    "rounded-xl transition-all duration-200 active:scale-95",
                    deviceType === "mobile" ? "h-9 text-xs gap-1.5" : "h-8 text-[10px] gap-1"
                  )}
                  onClick={() => {
                    // 添加健康记录逻辑
                  }}
                >
                  <Plus className={cn(
                    deviceType === "mobile" ? "h-3.5 w-3.5" : "h-3 w-3"
                  )} />
                  新记录
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn(
      "min-h-screen",
      // 微信小程序经典背景色 - 纯净的浅色背景
      "bg-gradient-to-br from-gray-50/50 via-white to-gray-100/30",
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
        totalPatients={families.reduce((sum, family) => sum + family.totalMembers, 0)}
        totalFamilies={families.length}
      />

      {/* 加载状态 */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
            <span className="text-gray-600 text-sm">正在加载患者数据...</span>
          </div>
        </div>
      )}

      {/* 微信小程序风格的家庭列表 */}
      <div className={cn(
        "space-y-4",
        deviceType === "mobile" ? "px-3 mt-4" : deviceType === "tablet" ? "px-4 mt-5" : "px-6 mt-6"
      )}>
        {!loading && filteredFamilies.map((family) => (
          <Card
            key={family.id}
            className={cn(
              // 微信小程序卡片风格 - 更简洁的设计
              "group bg-white rounded-3xl overflow-hidden",
              "shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer",
              "hover:scale-[1.01] active:scale-[0.99] transform-gpu",
              "border border-gray-100/80 hover:border-blue-200/70",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50",
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
                // 微信小程序头部风格 - 更清爽的设计
                "bg-gradient-to-r from-blue-50/70 to-blue-50/30",
                "border-b border-gray-100/80 relative overflow-hidden",
                deviceType === "mobile" ? "px-4 py-3.5" : "px-5 py-4"
              )}>
                {/* 微信小程序风格装饰元素 - 简约几何装饰 */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100/20 rounded-full -translate-y-10 translate-x-10" />
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-100/15 rounded-full translate-y-8 -translate-x-8" />
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      // 微信小程序图标风格 - 简洁圆润设计
                      "bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center",
                      "shadow-md relative overflow-hidden",
                      "group-hover:shadow-lg group-hover:scale-105 transition-all duration-200",
                      deviceType === "mobile" ? "w-11 h-11" : "w-12 h-12"
                    )}>
                      {/* 微信小程序图标光效 - 微妙的高光效果 */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent" />
                      <Users className={cn(
                        "text-white relative z-10",
                        deviceType === "mobile" ? "h-5 w-5" : "h-6 w-6"
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
                    {family.members && family.members.length > 0 && (
                      <Badge variant="outline" className={cn(
                        getPaymentStatusColor(family.members[0].paymentStatus),
                        // 微信小程序状态标签风格
                        "rounded-full font-medium border-0 shadow-sm",
                        deviceType === "mobile" ? "text-xs px-2.5 py-1" : "text-[10px] px-2 py-0.5"
                      )}>
                        {getPaymentStatusText(family.members[0].paymentStatus)}
                      </Badge>
                    )}
                    <div className={cn(
                      // 微信小程序箭头指示器
                      "bg-gray-100/80 rounded-full group-hover:bg-blue-100/80 transition-colors duration-200",
                      "min-w-[40px] min-h-[40px] flex items-center justify-center", // 确保触摸区域足够大
                      deviceType === "mobile" ? "p-2" : "p-1.5"
                    )}>
                      <ChevronRight className={cn(
                        "text-gray-600 group-hover:text-blue-600 transition-colors duration-200",
                        deviceType === "mobile" ? "h-4 w-4" : "h-3.5 w-3.5"
                      )} />
                    </div>
                  </div>
                </div>
              </div>

                  {/* 微信小程序内容区域 - 纯净背景 */}
              <div className={cn(
                "bg-white",
                deviceType === "mobile" ? "p-4" : "p-5"
              )}>
                <div className="space-y-4">
                  {/* 微信小程序信息卡片 - 简洁边框设计 */}
                  <div className="bg-gray-50/60 rounded-2xl p-3 space-y-3 border border-gray-100/80">
                    {/* 微信小程序信息项 - 简洁交互 */}
                    <div className="flex items-start gap-3 group/item hover:bg-white/70 rounded-xl p-2 -m-2 transition-all duration-150">
                      <div className="bg-blue-100/70 hover:bg-blue-200/60 transition-colors duration-150 p-1.5 rounded-lg group-hover/item:scale-105 transform transition-transform duration-150">
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
                    
                    {/* 微信小程序联系电话 - 简洁交互 */}
                    <div className="flex items-center gap-3 group/item hover:bg-white/70 rounded-xl p-2 -m-2 transition-all duration-150">
                      <div className="bg-green-100/70 hover:bg-green-200/60 transition-colors duration-150 p-1.5 rounded-lg group-hover/item:scale-105 transform transition-transform duration-150">
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
                    
                    {/* 微信小程序最近服务 - 简洁交互 */}
                    <div className="flex items-center gap-3 group/item hover:bg-white/70 rounded-xl p-2 -m-2 transition-all duration-150">
                      <div className="bg-purple-100/70 hover:bg-purple-200/60 transition-colors duration-150 p-1.5 rounded-lg group-hover/item:scale-105 transform transition-transform duration-150">
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

                {/* 微信小程序成员列表 */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className={cn(
                      "text-gray-800 font-semibold flex items-center gap-2",
                      deviceType === "mobile" ? "text-sm" : "text-xs"
                    )}>
                      <User className="h-4 w-4 text-indigo-600" />
                      家庭成员
                    </h4>
                    <Badge variant="secondary" className={cn(
                      // 微信小程序计数器风格
                      "bg-indigo-100/70 text-indigo-700 border-indigo-200/40 rounded-full",
                      deviceType === "mobile" ? "text-xs px-2 py-0.5" : "text-[10px] px-1.5 py-0.5"
                    )}>
                      {family.totalMembers}人
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {family.members.slice(0, 3).map((member, index) => (
                      <div key={member.id} className={cn(
                        // 微信小程序成员卡片
                        "flex items-center gap-3 bg-gray-50/80 rounded-xl border border-gray-100/80 transition-all duration-150",
                        "hover:bg-gray-50 hover:border-gray-200/90 hover:shadow-sm",
                        "group/member cursor-pointer active:scale-[0.99] transform",
                        deviceType === "mobile" ? "p-3" : "p-2.5"
                      )}>
                        <div className="bg-blue-500 p-1.5 rounded-lg group-hover/member:scale-105 transition-transform duration-150">
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
                              // 微信小程序关系标签
                              "bg-blue-50/60 text-blue-700 border-blue-200/40 rounded-full px-1.5 py-0",
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
                        // 微信小程序更多指示器
                        "flex items-center justify-center bg-gray-100/70 text-gray-700 rounded-xl border border-gray-200/40 font-medium",
                        deviceType === "mobile" ? "px-3 py-2 text-sm" : "px-2 py-1.5 text-xs"
                      )}>
                        +{family.members.length - 3}更多
                      </div>
                    )}
                  </div>
                </div>

                {/* 微信小程序快捷操作 - 简洁的三按钮布局 */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className={cn(
                        // 微信小程序按钮风格 - 纯净简洁
                        "bg-blue-50/60 hover:bg-blue-50 border-blue-200/60 hover:border-blue-300/80",
                        "text-blue-700 rounded-xl transition-all duration-150",
                        "active:scale-95 hover:shadow-sm flex-col gap-1",
                        "group/button border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50",
                        deviceType === "mobile" ? "h-auto py-2.5 text-xs min-h-[44px]" : "h-auto py-2 text-[10px] min-h-[40px]"
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        // 添加预约逻辑
                      }}
                      aria-label={`为 ${family.householdHead}家预约服务`}
                    >
                      <Calendar className={cn(
                        "group-hover/button:scale-105 transition-transform duration-150",
                        deviceType === "mobile" ? "h-4 w-4" : "h-3.5 w-3.5"
                      )} />
                      预约
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className={cn(
                        // 微信小程序按钮风格 - 纯净简洁
                        "bg-green-50/60 hover:bg-green-50 border-green-200/60 hover:border-green-300/80",
                        "text-green-700 rounded-xl transition-all duration-150",
                        "active:scale-95 hover:shadow-sm flex-col gap-1",
                        "group/button border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400/50",
                        deviceType === "mobile" ? "h-auto py-2.5 text-xs min-h-[44px]" : "h-auto py-2 text-[10px] min-h-[40px]"
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        // 添加联系逻辑
                      }}
                      aria-label={`联系 ${family.householdHead}家`}
                    >
                      <MessageCircle className={cn(
                        "group-hover/button:scale-105 transition-transform duration-150",
                        deviceType === "mobile" ? "h-4 w-4" : "h-3.5 w-3.5"
                      )} />
                      联系
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className={cn(
                        // 微信小程序按钮风格 - 纯净简洁
                        "bg-purple-50/60 hover:bg-purple-50 border-purple-200/60 hover:border-purple-300/80",
                        "text-purple-700 rounded-xl transition-all duration-150",
                        "active:scale-95 hover:shadow-sm flex-col gap-1",
                        "group/button border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50",
                        deviceType === "mobile" ? "h-auto py-2.5 text-xs min-h-[44px]" : "h-auto py-2 text-[10px] min-h-[40px]"
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        // 添加记录逻辑
                      }}
                      aria-label={`为 ${family.householdHead}家添加健康记录`}
                    >
                      <FileText className={cn(
                        "group-hover/button:scale-105 transition-transform duration-150",
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
      {!loading && filteredFamilies.length === 0 && (
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
          )}>
            {searchTerm ? '未找到相关患者' : '暂无患者数据'}
          </h3>
          <p className={cn(
            "text-gray-500 mb-4",
            deviceType === "mobile" ? "text-sm" : "text-xs"
          )}>
            {searchTerm ? '请尝试其他搜索词' : '请点击上方"新家庭"按钮添加患者信息'}
          </p>
          {!searchTerm && (
            <Button
              onClick={() => setShowNewFamilyModal(true)}
              className={cn(
                // 微信小程序主按钮风格
                "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
                "text-white border-0 rounded-2xl shadow-md",
                "active:scale-95 transition-all duration-150 hover:shadow-lg",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50",
                deviceType === "mobile" ? "px-6 py-3 text-sm gap-2 min-h-[44px]" : "px-4 py-2 text-xs gap-1.5 min-h-[40px]"
              )}
              aria-label="创建首个家庭档案"
            >
              <UserPlus className={cn(
                deviceType === "mobile" ? "h-4 w-4" : "h-3.5 w-3.5"
              )} />
              创建首个家庭档案
            </Button>
          )}
        </div>
      )}

      {showNewFamilyModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-3">
          <div className={cn(
            // 微信小程序模态框风格 - 优化整体结构
            "bg-white rounded-3xl shadow-xl border border-gray-100",
            "w-full flex flex-col",
            // 优化高度设置，确保在移动端不会超出屏幕
            deviceType === "mobile" 
              ? "max-w-[95vw] max-h-[92vh]" 
              : deviceType === "tablet" 
              ? "max-w-2xl max-h-[88vh]" 
              : "max-w-3xl max-h-[85vh]"
          )}>
            {/* 微信小程序模态框标题栏 */}
            <div className={cn(
              "bg-gray-50/60 border-b border-gray-100",
              "flex items-center justify-between",
              deviceType === "mobile" ? "px-4 py-4" : deviceType === "tablet" ? "px-5 py-4" : "px-6 py-5"
            )}>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-500/10 rounded-2xl">
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
                  "rounded-full hover:bg-gray-100 active:scale-95 transition-all duration-150",
                  "bg-gray-50 shadow-sm border border-gray-200",
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
              // 减少最大高度，为底部按钮预留空间
              deviceType === "mobile" ? "max-h-[60vh]" : deviceType === "tablet" ? "max-h-[65vh]" : "max-h-[70vh]"
            )}>
              <div className={cn(
                "space-y-6",
                deviceType === "mobile" ? "p-4 pb-2" : deviceType === "tablet" ? "p-5 pb-3" : "p-6 pb-4"
              )}>
                {/* 微信小程序基本信息卡片 */}
                <div className={cn(
                  "bg-gray-50/60 rounded-2xl border border-gray-100",
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
                          "border-gray-200 bg-white rounded-xl focus:bg-white transition-all duration-150",
                          "focus:border-blue-400 focus:ring-2 focus:ring-blue-100",
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
                          "border-gray-200 bg-white rounded-xl focus:bg-white transition-all duration-150",
                          "focus:border-blue-400 focus:ring-2 focus:ring-blue-100",
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
                        "border-gray-200 bg-white rounded-xl focus:bg-white transition-all duration-150",
                        "focus:border-blue-400 focus:ring-2 focus:ring-blue-100",
                        deviceType === "mobile" ? "h-10 text-sm" : "h-11 text-sm"
                      )}
                    />
                  </div>
                </div>

                {/* 微信小程序家庭成员卡片 */}
                <div className={cn(
                  "bg-gray-50/60 rounded-2xl border border-gray-100",
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
                        "bg-blue-50/60 hover:bg-blue-100/60 border-blue-200/60 text-blue-700",
                        "rounded-xl shadow-sm active:scale-95 transition-all duration-150",
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
                        // 微信小程序成员项卡片
                        "bg-white/80 rounded-2xl border border-gray-200/60",
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
                                "rounded-full hover:bg-red-50 text-red-500 active:scale-95 transition-all duration-150",
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
                                "border-gray-200 bg-white rounded-lg focus:bg-white transition-all duration-150",
                                "focus:border-blue-400 focus:ring-2 focus:ring-blue-100",
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
                              value={member.age.toString()}
                              onChange={(e) => updateFamilyMember(index, "age", e.target.value)}
                              placeholder="年龄"
                              type="number"
                              className={cn(
                                "border-gray-200 bg-white rounded-lg focus:bg-white transition-all duration-150",
                                "focus:border-blue-400 focus:ring-2 focus:ring-blue-100",
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
                                "w-full border-gray-200 bg-white rounded-lg focus:bg-white",
                                "focus:border-blue-400 focus:ring-2 focus:ring-blue-100",
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
                                "border-gray-200 bg-white rounded-lg focus:bg-white transition-all duration-150",
                                "focus:border-blue-400 focus:ring-2 focus:ring-blue-100",
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
                                "w-full border-gray-200 bg-white rounded-lg focus:bg-white",
                                "focus:border-blue-400 focus:ring-2 focus:ring-blue-100",
                                deviceType === "mobile" ? "h-8 text-xs px-2" : "h-9 text-sm px-3"
                              )}>
                                <SelectValue placeholder="选择套餐" />
                              </SelectTrigger>
                              <SelectContent>
                                {loadingPackages ? (
                                  <SelectItem value="" disabled>加载中...</SelectItem>
                                ) : (
                                  servicePackages.map((pkg) => (
                                    <SelectItem key={pkg.id} value={pkg.name}>
                                      {pkg.name} - ¥{pkg.price}/月
                                    </SelectItem>
                                  ))
                                )}
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
                              "border-gray-200 bg-white rounded-lg focus:bg-white transition-all duration-150",
                              "focus:border-blue-400 focus:ring-2 focus:ring-blue-100",
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

            {/* 微信小程序底部操作栏 - 固定在底部 */}
            <div className={cn(
              "bg-white border-t border-gray-100 sticky bottom-0",
              "flex gap-3 z-10 shadow-lg",
              // 确保在所有设备上都有足够的内边距
              deviceType === "mobile" ? "p-4 pb-6" : deviceType === "tablet" ? "p-5 pb-6" : "p-6"
            )}>
              <Button 
                variant="outline" 
                onClick={() => setShowNewFamilyModal(false)} 
                className={cn(
                  "flex-1 bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700",
                  "rounded-2xl shadow-sm active:scale-95 transition-all duration-150",
                  deviceType === "mobile" ? "h-10 text-sm" : "h-11 text-base"
                )}
              >
                取消
              </Button>
              <Button 
                onClick={handleSubmitNewFamily} 
                className={cn(
                  "flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
                  "text-white border-0 rounded-2xl shadow-md active:scale-95 transition-all duration-150",
                  "hover:shadow-lg focus:ring-2 focus:ring-blue-400/50",
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
