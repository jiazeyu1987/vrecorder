"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BottomNavigation } from "@/components/bottom-navigation"
import { WechatRecordHeader } from "@/components/wechat-record-header"
import { ProtectedRoute } from "@/components/protected-route"
import { useIsMobile } from "@/hooks/use-mobile"
import { useDeviceType } from "@/hooks/use-wechat-responsive"
import { FamilySelector } from "@/components/family-selector"
import type { Family } from "@/lib/api"
import { cn } from "@/lib/utils"
import {
  FileText,
  Calendar,
  MapPin,
  User,
  Package,
  Square,
  Mic,
  Upload,
  Clock,
  Activity,
  Heart,
  Thermometer,
  Camera,
  Play,
  AlertCircle,
  CheckCircle,
  Loader2,
  Trash2,
  Edit3,
  Save,
  Users,
  Moon,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

interface HealthRecord {
  id: string
  date: string
  time: string
  patientName: string
  patientAge: number
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
  audioRecording?: string
  recordingDuration?: number
  uploadStatus?: "pending" | "uploading" | "uploaded" | "failed"
  uploadedAt?: string
}

interface CurrentAppointment {
  id: string
  patientName: string
  patientAge: number
  serviceType: string
  date: string
  time: string
  location: string
  packageType: string
  paymentStatus: "paid" | "pending" | "overdue"
}

// Mock current appointment data
const currentAppointment: CurrentAppointment = {
  id: "1",
  patientName: "李老太",
  patientAge: 79,
  serviceType: "基础健康监测",
  date: "2024-03-15",
  time: "09:30",
  location: "朝阳区建国路88号",
  packageType: "高级护理套餐",
  paymentStatus: "paid",
}

// Mock historical records data
const mockHistoricalRecords: HealthRecord[] = [
  {
    id: "3",
    date: "2024-03-10",
    time: "14:00",
    patientName: "李老太",
    patientAge: 79,
    serviceType: "血压监测",
    location: "朝阳区建国路88号",
    vitals: {
      bloodPressure: "140/90",
      heartRate: 82,
      temperature: 36.6,
    },
    observations: "血压偏高，需要调整用药",
    photos: ["血压测量.jpg"],
    audioNotes: ["用药指导.mp3"],
    recommendations: "建议减少盐分摄入，按时服药",
    status: "completed",
    uploadStatus: "uploaded",
    uploadedAt: "2024-03-10T14:30:00Z",
  },
  {
    id: "2",
    date: "2024-03-08",
    time: "10:00",
    patientName: "李老太",
    patientAge: 79,
    serviceType: "综合健康评估",
    location: "朝阳区建国路88号",
    vitals: {
      bloodPressure: "135/85",
      heartRate: 78,
      temperature: 36.5,
      bloodSugar: 6.8,
      weight: 58,
    },
    observations: "整体状况良好，血糖略高",
    photos: ["健康评估.jpg", "血糖测试.jpg"],
    audioNotes: ["患者主诉.mp3"],
    recommendations: "控制饮食，适量运动",
    nextVisit: "2024-03-15",
    status: "completed",
    uploadStatus: "uploaded",
    uploadedAt: "2024-03-08T10:30:00Z",
  },
  {
    id: "1",
    date: "2024-03-05",
    time: "09:00",
    patientName: "李老太",
    patientAge: 79,
    serviceType: "基础护理",
    location: "朝阳区建国路88号",
    vitals: {
      bloodPressure: "130/80",
      heartRate: 75,
      temperature: 36.4,
    },
    observations: "患者精神状态良好",
    photos: [],
    audioNotes: [],
    recommendations: "继续保持良好的生活习惯",
    status: "completed",
    uploadStatus: "uploaded",
    uploadedAt: "2024-03-05T09:30:00Z",
  },
]

interface FamilyMemberHealth {
  memberId: string
  memberName: string
  memberAge?: number
  memberGender?: string
  memberRelationship?: string
  memberConditions?: string[]
  memberMedications?: string[]
  memberPackageType?: string
  bloodPressure?: string
  bloodSugar?: string
  bowelMovement?: string
  sleepQuality?: string
  notes?: string
}

interface FamilyHealthRecord {
  recordId: string
  date: string
  time: string
  familyMembers: FamilyMemberHealth[]
  isEditable: boolean
  familyId?: string
  familyName?: string
}

const familyMembers = [
  { id: "1", name: "李红", age: 45, relation: "女儿" },
  { id: "2", name: "李刚", age: 48, relation: "女婿" },
  { id: "3", name: "李博", age: 22, relation: "孙子" },
]

export default function RecordsPage() {
  const searchParams = useSearchParams()
  const patientId = searchParams.get("patientId")
  const familyId = searchParams.get("familyId")
  const familyName = searchParams.get("familyName")
  const patientName = searchParams.get("patientName")
  const service = searchParams.get("service")
  const time = searchParams.get("time")
  const address = searchParams.get("address")

  console.log("[Records] URL参数:", {
    patientId, familyId, familyName, patientName, service, time, address
  })
  const appointmentId = searchParams.get("appointmentId")
  const taskType = searchParams.get("taskType")

  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [currentRecord, setCurrentRecord] = useState<Partial<HealthRecord> | null>(null)
  const [localRecords, setLocalRecords] = useState<HealthRecord[]>([])
  const [recordingError, setRecordingError] = useState<string | null>(null)
  const [audioPermission, setAudioPermission] = useState<"granted" | "denied" | "prompt">("prompt")
  const [uploadingRecords, setUploadingRecords] = useState<Set<string>>(new Set())
  const [familyHealthRecords, setFamilyHealthRecords] = useState<FamilyHealthRecord[]>([])
  const [historySelectedFamilyId, setHistorySelectedFamilyId] = useState<string>("")
  const [historySelectedFamily, setHistorySelectedFamily] = useState<Family | null>(null)
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set())
  const audioUrlRef = useRef<string | null>(null)

  // 基于选中的家庭生成家庭成员健康记录数据
  const getFamilyMembersForPatient = (family: Family | null): FamilyMemberHealth[] => {
    if (!family || !family.members) {
      console.log("[Records] 没有选中家庭或家庭成员数据，返回空数组")
      return []
    }

    console.log("[Records] 基于选中家庭生成成员健康记录:", family.householdHead, "成员数:", family.members.length)

    // 将家庭成员转换为健康记录格式
    const result = family.members.map((member) => ({
      memberId: member.id,
      memberName: member.name,
      memberAge: member.age,
      memberGender: member.gender,
      memberRelationship: member.relationship,
      memberConditions: member.conditions,
      memberMedications: member.medications,
      memberPackageType: member.packageType,
      bloodPressure: "",
      bloodSugar: "",
      bowelMovement: "",
      sleepQuality: "",
      notes: ""
    }))

    console.log("[Records] 生成的家庭成员健康记录:", result)
    return result
  }

  const [currentFamilyHealth, setCurrentFamilyHealth] = useState<FamilyMemberHealth[]>(() =>
    getFamilyMembersForPatient(null),
  )
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>("")
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null)
  const [refreshKey, setRefreshKey] = useState<number>(0)
  const [isChangingFamily, setIsChangingFamily] = useState<boolean>(false)

  const getCurrentAppointmentData = (): CurrentAppointment => {
    // 如果选择了家庭，优先使用选择的家庭信息
    if (selectedFamily) {
      return {
        id: selectedFamily.id,
        patientName: selectedFamily.householdHead,
        patientAge: getPatientAge(selectedFamily.householdHead),
        serviceType: getServiceTypeForFamily(selectedFamily.householdHead),
        date: new Date().toISOString().split("T")[0],
        time: getServiceTimeForFamily(selectedFamily.householdHead),
        location: selectedFamily.address,
        packageType: getPackageType(selectedFamily.householdHead),
        paymentStatus: "paid" as const,
      }
    }
    
    // 优先使用从日程页面传来的家庭信息
    if (familyId && familyName && service && time && address) {
      return {
        id: familyId,
        patientName: decodeURIComponent(familyName),
        patientAge: getPatientAge(decodeURIComponent(familyName)),
        serviceType: decodeURIComponent(service),
        date: new Date().toISOString().split("T")[0],
        time: decodeURIComponent(time),
        location: decodeURIComponent(address),
        packageType: getPackageType(decodeURIComponent(familyName)),
        paymentStatus: "paid" as const,
      }
    }
    
    // 兼容旧的参数格式
    if (patientId && patientName && service && time && address) {
      return {
        id: patientId,
        patientName: decodeURIComponent(patientName),
        patientAge: getPatientAge(patientName),
        serviceType: decodeURIComponent(service),
        date: new Date().toISOString().split("T")[0],
        time: decodeURIComponent(time),
        location: decodeURIComponent(address),
        packageType: getPackageType(patientName),
        paymentStatus: "paid" as const,
      }
    }

    return {
      id: "1",
      patientName: "李老太",
      patientAge: 79,
      serviceType: "基础健康监测",
      date: "2024-03-15",
      time: "09:30",
      location: "朝阳区建国路88号",
      packageType: "高级护理套餐",
      paymentStatus: "paid",
    }
  }

  const getPatientAge = (patientName: string | null): number => {
    const ageData: { [key: string]: number } = {
      张明: 65,
      李华: 62,
      王奶奶: 71,
      "王秀英": 71,
      陈爷爷: 78,
      "陈建国": 78,
      李老太: 79,
    }
    return ageData[patientName || ""] || 79
  }

  const getServiceTypeForFamily = (patientName: string): string => {
    const serviceData: { [key: string]: string } = {
      张明: "基础健康监测",
      李华: "综合健康评估", 
      "王秀英": "血压测量",
      "陈建国": "康复训练",
      李老太: "基础健康监测",
    }
    return serviceData[patientName] || "基础健康监测"
  }

  const getServiceTimeForFamily = (patientName: string): string => {
    const timeData: { [key: string]: string } = {
      张明: "09:00-10:00",
      李华: "14:00-15:30",
      "王秀英": "16:00-17:00",
      "陈建国": "08:00-09:00", 
      李老太: "09:30-10:30",
    }
    return timeData[patientName] || "09:30-10:30"
  }

  const getPackageType = (patientName: string | null): string => {
    const packageData: { [key: string]: string } = {
      张明: "基础护理套餐",
      李华: "综合护理套餐",
      王奶奶: "高级护理套餐",
      "王秀英": "高级护理套餐",
      陈爷爷: "康复护理套餐",
      "陈建国": "康复护理套餐",
      李老太: "高级护理套餐",
    }
    return packageData[patientName || ""] || "高级护理套餐"
  }

  const currentAppointment = getCurrentAppointmentData()

  useEffect(() => {
    setCurrentFamilyHealth(getFamilyMembersForPatient(selectedFamily))
  }, [selectedFamily])

  // URL参数自动选择功能现在由FamilySelector组件处理

  const [isEditingFamilyHealth, setIsEditingFamilyHealth] = useState(true) // Default to true so it's always expanded

  // Audio recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  const isMobile = useIsMobile()
  const deviceType = useDeviceType()

  const saveRecordsToStorage = (records: HealthRecord[]) => {
    try {
      const dataToSave = {
        records,
        timestamp: new Date().toISOString(),
        version: "1.0",
      }
      localStorage.setItem("healthRecords", JSON.stringify(dataToSave))
      console.log("[v0] Records saved to localStorage successfully")
    } catch (error) {
      console.error("[v0] Error saving records to localStorage:", error)
      // Handle storage quota exceeded
      if (error instanceof Error && error.name === "QuotaExceededError") {
        alert("存储空间不足，请清理一些旧记录或上传到服务器")
      }
    }
  }

  const loadRecordsFromStorage = () => {
    try {
      const savedData = localStorage.getItem("healthRecords")
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        // Handle both old format (direct array) and new format (object with metadata)
        const records = Array.isArray(parsedData) ? parsedData : parsedData.records || []
        return records.filter((record: any) => record && record.id) // Validate records
      }
    } catch (error) {
      console.error("[v0] Error loading records from localStorage:", error)
      // Clear corrupted data
      localStorage.removeItem("healthRecords")
    }
    return []
  }

  useEffect(() => {
    // 创建示例记录以便测试（强制覆盖现有数据）
    const sampleRecords: FamilyHealthRecord[] = [
      {
        recordId: "sample-1",
        date: new Date().toISOString().split('T')[0],
        time: "09:30",
        familyId: "family-1",
        familyName: "张三家庭",
        isEditable: false,
        familyMembers: [
          {
            memberId: "member-1",
            memberName: "张三",
            memberAge: 45,
            memberGender: "男",
            memberRelationship: "户主",
            memberConditions: ["高血压", "糖尿病"],
            memberMedications: ["降压药", "二甲双胍"],
            memberPackageType: "基础套餐",
            bloodPressure: "135/90",
            bloodSugar: "7.2",
            bowelMovement: "正常",
            sleepQuality: "一般",
            notes: "血压略高，需要调整用药剂量"
          },
          {
            memberId: "member-2", 
            memberName: "李四",
            memberAge: 42,
            memberGender: "女",
            memberRelationship: "配偶",
            memberConditions: ["轻度贫血"],
            memberMedications: ["铁剂"],
            memberPackageType: "标准套餐",
            bloodPressure: "120/75",
            bloodSugar: "5.8",
            bowelMovement: "偶尔便秘",
            sleepQuality: "良好",
            notes: "整体健康状况良好，继续补铁治疗"
          }
        ]
      },
      {
        recordId: "sample-2",
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // 昨天
        time: "14:15",
        familyId: "family-2",
        familyName: "王五家庭",
        isEditable: false,
        familyMembers: [
          {
            memberId: "member-3",
            memberName: "王五",
            memberAge: 38,
            memberGender: "男",
            memberRelationship: "户主",
            memberConditions: ["高血脂"],
            memberMedications: ["他汀类"],
            memberPackageType: "标准套餐",
            bloodPressure: "125/80",
            bloodSugar: "6.1",
            bowelMovement: "正常",
            sleepQuality: "良好",
            notes: "血脂控制良好，继续保持饮食和运动习惯"
          }
        ]
      }
    ]
    
    setFamilyHealthRecords(sampleRecords)
    localStorage.setItem("familyHealthRecords", JSON.stringify(sampleRecords))
    console.log("[Records] 强制创建示例健康记录数据", sampleRecords)
  }, [])

  // Load local records from localStorage on mount
  useEffect(() => {
    const savedRecords = loadRecordsFromStorage()
    setLocalRecords(savedRecords)
  }, [])

  // Timer for recording
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  // Check audio permissions
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const permission = await navigator.permissions.query({ name: "microphone" as PermissionName })
        setAudioPermission(permission.state)

        permission.addEventListener("change", () => {
          setAudioPermission(permission.state)
        })
      } catch (error) {
        console.log("[v0] Permission API not supported")
      }
    }

    checkPermissions()
  }, [])

  const startRecording = async () => {
    try {
      console.log("[v0] Requesting microphone access")
      setRecordingError(null)

      // Initialize family health tracking
      const initialFamilyHealth = familyMembers.map((member) => ({
        memberId: member.id,
        memberName: member.name,
        bloodPressure: "",
        bloodSugar: "",
        bowelMovement: "",
        sleepQuality: "",
        notes: "",
      }))
      setCurrentFamilyHealth(initialFamilyHealth)
      setIsEditingFamilyHealth(true)

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      })

      streamRef.current = stream
      audioChunksRef.current = []

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4",
      })

      mediaRecorderRef.current = mediaRecorder

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      // Handle recording stop
      mediaRecorder.onstop = () => {
        console.log("[v0] Recording stopped, processing audio")
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || "audio/webm",
        })
        const audioUrl = URL.createObjectURL(audioBlob)

        if (currentRecord) {
          const completedRecord: HealthRecord = {
            ...currentRecord,
            audioRecording: audioUrl,
            recordingDuration: recordingTime,
            audioNotes: [
              `录音记录_${new Date().toLocaleTimeString("zh-CN")}.${mediaRecorder.mimeType?.includes("webm") ? "webm" : "mp4"}`,
            ],
            observations: currentRecord.observations || "本次服务记录已完成，包含语音记录",
            recommendations: currentRecord.recommendations || "请根据录音内容完善详细信息",
            uploadStatus: "pending",
          } as HealthRecord

          // Save to local storage
          const updatedLocalRecords = [completedRecord, ...localRecords]
          setLocalRecords(updatedLocalRecords)
          saveRecordsToStorage(updatedLocalRecords)

          console.log("[v0] Record saved to local storage")
        }

        // Save family health record
        if (currentFamilyHealth.length > 0) {
          const newFamilyHealthRecord: FamilyHealthRecord = {
            recordId: Date.now().toString(),
            date: currentAppointment.date,
            time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
            familyMembers: currentFamilyHealth,
            isEditable: true,
            familyId: selectedFamily?.id,
            familyName: selectedFamily?.householdHead,
          }

          const updatedFamilyRecords = [newFamilyHealthRecord, ...familyHealthRecords]
          setFamilyHealthRecords(updatedFamilyRecords)

          // Save to localStorage
          localStorage.setItem("familyHealthRecords", JSON.stringify(updatedFamilyRecords))
        }

        // Cleanup
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
          streamRef.current = null
        }
      }

      // Start recording
      mediaRecorder.start(1000) // Collect data every second
      setIsRecording(true)
      setRecordingTime(0)

      // Initialize current record
      setCurrentRecord({
        id: Date.now().toString(),
        date: currentAppointment.date,
        time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
        patientName: currentAppointment.patientName,
        patientAge: currentAppointment.patientAge,
        serviceType: currentAppointment.serviceType,
        location: currentAppointment.location,
        vitals: {},
        observations: "",
        photos: [],
        audioNotes: [],
        recommendations: "",
        status: "draft",
      })

      console.log("[v0] Recording started successfully")
    } catch (error) {
      console.error("[v0] Error starting recording:", error)
      setRecordingError(
        error instanceof Error
          ? error.name === "NotAllowedError"
            ? "麦克风权限被拒绝，请在浏览器设置中允许麦克风访问"
            : error.name === "NotFoundError"
              ? "未找到麦克风设备"
              : `录音启动失败: ${error.message}`
          : "录音启动失败，请检查设备和权限设置",
      )
    }
  }

  const stopRecording = async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (currentRecord) {
        const completedRecord: HealthRecord = {
          id: Date.now().toString(),
          patientName: currentAppointment.patientName,
          date: new Date().toISOString().split("T")[0],
          time: new Date().toLocaleTimeString("zh-CN", { hour12: false }),
          serviceType: currentAppointment.serviceType,
          ...currentRecord,
          familyHealthData: currentFamilyHealth.filter(
            (member) => member.bloodPressure || member.bloodSugar || member.bowelMovement || member.sleepQuality,
          ),
          audioRecording: audioUrlRef.current || undefined,
          recordingDuration: recordingTime,
          uploadStatus: "pending",
        } as HealthRecord

        const updatedLocalRecords = [...localRecords, completedRecord]
        setLocalRecords(updatedLocalRecords)
        saveRecordsToStorage(updatedLocalRecords)

        // 注意：不要自动标记预约为完成，让用户手动操作
        console.log("[v0] 健康记录已保存，但预约状态需要用户手动更新")

        setCurrentRecord(null)
        setCurrentFamilyHealth(getFamilyMembersForPatient(selectedFamily))
        alert("记录已完成并保存到本地！")
      }
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }

  const uploadRecord = async (recordId: string) => {
    console.log("[v0] Starting upload for record:", recordId)

    setUploadingRecords((prev) => new Set(prev).add(recordId))

    // Update record status to uploading
    const updatedRecords = localRecords.map((record) =>
      record.id === recordId ? { ...record, uploadStatus: "uploading" as const } : record,
    )
    setLocalRecords(updatedRecords)
    saveRecordsToStorage(updatedRecords)

    try {
      // Simulate upload process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate random success/failure for demo
      const success = Math.random() > 0.2 // 80% success rate

      if (success) {
        // Update record status to uploaded
        const finalRecords = localRecords.map((record) =>
          record.id === recordId
            ? {
                ...record,
                uploadStatus: "uploaded" as const,
                uploadedAt: new Date().toISOString(),
              }
            : record,
        )
        setLocalRecords(finalRecords)
        saveRecordsToStorage(finalRecords)

        console.log("[v0] Record uploaded successfully:", recordId)
        alert("记录上传成功！")
      } else {
        throw new Error("Upload failed")
      }
    } catch (error) {
      console.error("[v0] Upload failed:", error)

      // Update record status to failed
      const failedRecords = localRecords.map((record) =>
        record.id === recordId ? { ...record, uploadStatus: "failed" as const } : record,
      )
      setLocalRecords(failedRecords)
      saveRecordsToStorage(failedRecords)

      alert("上传失败，请检查网络连接后重试")
    } finally {
      setUploadingRecords((prev) => {
        const newSet = new Set(prev)
        newSet.delete(recordId)
        return newSet
      })
    }
  }

  const updateFamilyMemberHealth = (memberId: string, field: keyof FamilyMemberHealth, value: string) => {
    setCurrentFamilyHealth((prev) =>
      prev.map((member) => (member.memberId === memberId ? { ...member, [field]: value } : member)),
    )
  }

  const deleteRecord = (recordId: string) => {
    if (confirm("确定要删除这条记录吗？删除后无法恢复。")) {
      const updatedRecords = localRecords.filter((record) => record.id !== recordId)
      setLocalRecords(updatedRecords)
      saveRecordsToStorage(updatedRecords)
      console.log("[v0] Record deleted:", recordId)
    }
  }

  const uploadAllPendingRecords = async () => {
    const pendingRecords = localRecords.filter(
      (record) => record.uploadStatus === "pending" || record.uploadStatus === "failed",
    )

    if (pendingRecords.length === 0) {
      alert("没有待上传的记录")
      return
    }

    if (confirm(`确定要上传 ${pendingRecords.length} 条记录吗？`)) {
      for (const record of pendingRecords) {
        await uploadRecord(record.id)
        // Add small delay between uploads
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }
  }

  const editFamilyHealthRecord = (recordId: string) => {
    // 设置记录为可编辑状态
    setFamilyHealthRecords((prev) =>
      prev.map((record) => (record.recordId === recordId ? { ...record, isEditable: true } : record)),
    )
    // 同时展开记录以显示编辑表单
    setExpandedRecords(prev => {
      const newSet = new Set(prev)
      newSet.add(recordId)
      console.log("[Records] 编辑时自动展开记录:", recordId)
      return newSet
    })
  }

  const saveFamilyHealthRecord = (recordId: string) => {
    setFamilyHealthRecords((prev) => {
      const updated = prev.map((record) => (record.recordId === recordId ? { ...record, isEditable: false } : record))
      localStorage.setItem("familyHealthRecords", JSON.stringify(updated))
      return updated
    })
  }

  const deleteFamilyHealthRecord = (recordId: string) => {
    if (confirm("确定要删除这条健康记录吗？删除后无法恢复。")) {
      setFamilyHealthRecords((prev) => {
        const updated = prev.filter(record => record.recordId !== recordId)
        localStorage.setItem("familyHealthRecords", JSON.stringify(updated))
        return updated
      })
      console.log("[Records] 删除家庭健康记录:", recordId)
    }
  }

  // 切换记录详情展开状态
  const toggleRecordExpanded = (recordId: string) => {
    setExpandedRecords(prev => {
      const newSet = new Set(prev)
      if (newSet.has(recordId)) {
        newSet.delete(recordId)
        console.log("[Records] 收起记录详情:", recordId)
      } else {
        newSet.add(recordId)
        console.log("[Records] 展开记录详情:", recordId)
      }
      return newSet
    })
  }

  const updateExistingFamilyRecord = (
    recordId: string,
    memberId: string,
    field: keyof FamilyMemberHealth,
    value: string,
  ) => {
    setFamilyHealthRecords((prev) =>
      prev.map((record) =>
        record.recordId === recordId
          ? {
              ...record,
              familyMembers: record.familyMembers.map((member) =>
                member.memberId === memberId ? { ...member, [field]: value } : member,
              ),
            }
          : record,
      ),
    )
  }

  // 处理历史记录家庭选择 - 与主选择器保持同步
  const handleHistoryFamilySelect = (familyId: string, family: Family | null) => {
    // 同步更新两个选择器的状态
    setHistorySelectedFamilyId(familyId)
    setHistorySelectedFamily(family)
    setSelectedFamilyId(familyId)
    setSelectedFamily(family)
    setRefreshKey(prev => prev + 1) // 触发重新渲染
    
    // 根据选择的家庭更新家庭成员健康记录
    if (family) {
      setCurrentFamilyHealth(getFamilyMembersForPatient(family))
    }
    
    console.log("[Records] 历史记录选择家庭（同步到主选择器）:", family?.householdHead)
  }

  // 根据选择的家庭过滤历史记录
  const getFilteredHistoryRecords = () => {
    if (!historySelectedFamily) {
      return familyHealthRecords
    }
    
    // 根据选择的家庭ID或名称过滤记录
    return familyHealthRecords.filter(record => {
      return record.familyId === historySelectedFamily.id || 
             record.familyName === historySelectedFamily.householdHead
    })
  }

  const playAudio = (audioUrl: string) => {
    console.log("[v0] Playing audio:", audioUrl)
    const audio = new Audio(audioUrl)
    audio.play().catch((error) => {
      console.error("[v0] Error playing audio:", error)
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
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

  const getUploadStatusColor = (status?: string) => {
    switch (status) {
      case "uploaded":
        return "bg-green-100 text-green-700"
      case "uploading":
        return "bg-blue-100 text-blue-700"
      case "failed":
        return "bg-red-100 text-red-700"
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-700"
    }
  }

  const getUploadStatusText = (status?: string) => {
    switch (status) {
      case "uploaded":
        return "已上传"
      case "uploading":
        return "上传中"
      case "failed":
        return "上传失败"
      case "pending":
      default:
        return "待上传"
    }
  }

  const getUploadStatusIcon = (status?: string) => {
    switch (status) {
      case "uploaded":
        return <CheckCircle className="h-3 w-3" />
      case "uploading":
        return <Loader2 className="h-3 w-3 animate-spin" />
      case "failed":
        return <AlertCircle className="h-3 w-3" />
      case "pending":
      default:
        return <Upload className="h-3 w-3" />
    }
  }

  const handleFamilySelect = (familyId: string, family: Family | null) => {
    // 显示变化中的视觉反馈
    setIsChangingFamily(true)
    
    // 同步更新两个选择器的状态
    setSelectedFamilyId(familyId)
    setSelectedFamily(family)
    setHistorySelectedFamilyId(familyId)
    setHistorySelectedFamily(family)
    setRefreshKey(prev => prev + 1) // 触发重新渲染
    
    // 根据选择的家庭更新家庭成员健康记录
    if (family) {
      setCurrentFamilyHealth(getFamilyMembersForPatient(family))
    }
    
    console.log("[Records] 主选择器选择家庭（同步到历史选择器）:", family?.householdHead)
    
    // 1秒后隐藏变化反馈
    setTimeout(() => {
      setIsChangingFamily(false)
    }, 1000)
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700"
      case "pending":
        return "bg-yellow-100 text-yellow-700"
      case "overdue":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "已付费"
      case "pending":
        return "待付费"
      case "overdue":
        return "逾期"
      default:
        return "未知"
    }
  }


  return (
    <ProtectedRoute>
      <div className={`min-h-screen bg-gray-50 ${deviceType === "mobile" ? "pb-24" : deviceType === "tablet" ? "pb-22" : "pb-20"}`}>
      {/* 微信风格的记录页头部 */}
      <WechatRecordHeader
        title="家庭记录"
        subtitle="记录和管理家庭健康信息"
        onAdd={() => {
          // 开始新的记录
          if (!isRecording) {
            startRecording()
          }
        }}
        onSearch={() => {
          // TODO: 实现搜索功能
          console.log("Search records")
        }}
        onFilter={() => {
          // TODO: 实现筛选功能
          console.log("Filter records")
        }}
      />

      {/* 大圆形开始记录按钮 - 页面顶部 */}
      <div className={`flex justify-center ${deviceType === "mobile" ? "py-4 px-4" : deviceType === "tablet" ? "py-5 px-5" : "py-6 px-6"}`}>
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={audioPermission === "denied"}
          className={`
            relative overflow-hidden transition-all duration-500 transform hover:scale-105 active:scale-95
            ${deviceType === "mobile" ? "w-20 h-20" : deviceType === "tablet" ? "w-24 h-24" : "w-28 h-28"}
            rounded-full shadow-2xl border-4 border-white/30 backdrop-blur-sm
            ${isRecording 
              ? "bg-gradient-to-br from-red-400 via-red-500 to-red-600 hover:from-red-500 hover:via-red-600 hover:to-red-700 shadow-red-500/50 animate-pulse" 
              : "bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 hover:from-blue-500 hover:via-blue-600 hover:to-blue-700 shadow-blue-500/50"
            }
            ${audioPermission === "denied" ? "opacity-50 cursor-not-allowed" : "hover:shadow-3xl"}
          `}
        >
          <div className="flex flex-col items-center justify-center text-white relative z-10">
            {isRecording ? (
              <>
                <Square className={`${deviceType === "mobile" ? "h-6 w-6" : deviceType === "tablet" ? "h-7 w-7" : "h-8 w-8"} mb-1`} />
                <span className={`font-bold ${deviceType === "mobile" ? "text-xs" : "text-sm"}`}>停止</span>
              </>
            ) : (
              <>
                <Mic className={`${deviceType === "mobile" ? "h-6 w-6" : deviceType === "tablet" ? "h-7 w-7" : "h-8 w-8"} mb-1`} />
                <span className={`font-bold ${deviceType === "mobile" ? "text-xs" : "text-sm"}`}>记录</span>
              </>
            )}
          </div>
          
          {/* 动画波纹效果 */}
          {isRecording && (
            <div className="absolute inset-0 rounded-full">
              <div className="absolute inset-0 rounded-full bg-red-400/20 animate-ping"></div>
              <div className="absolute inset-2 rounded-full bg-red-300/30 animate-ping animation-delay-75"></div>
              <div className="absolute inset-4 rounded-full bg-red-200/40 animate-ping animation-delay-150"></div>
            </div>
          )}
        </Button>
      </div>

      {/* 录音状态显示和错误提示 */}
      {(isRecording || recordingError) && (
        <div className={`flex justify-center ${deviceType === "mobile" ? "px-4 pb-2" : deviceType === "tablet" ? "px-5 pb-3" : "px-6 pb-4"}`}>
          {isRecording && (
            <div className="bg-red-50 border-2 border-red-200 rounded-full px-6 py-3 shadow-lg">
              <div className="flex items-center justify-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-700 font-medium">正在录音...</span>
                <div className="text-xl font-mono text-red-600 bg-white/70 px-3 py-1 rounded-full">
                  {formatTime(recordingTime)}
                </div>
              </div>
            </div>
          )}
          
          {recordingError && (
            <div className="bg-red-50 border-2 border-red-200 rounded-full px-6 py-3 shadow-lg">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">{recordingError}</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className={`space-y-3 ${deviceType === "mobile" ? "px-3 py-3" : deviceType === "tablet" ? "px-4 py-4" : "px-6 py-6 max-w-5xl mx-auto"}`}>

        {/* 家庭选择器 */}
        <FamilySelector
          selectedFamilyId={selectedFamilyId}
          onFamilySelect={handleFamilySelect}
          className="mb-4"
          autoSelectId={familyId || undefined}
          autoSelectName={familyName || undefined}
        />

        {/* Current Appointment Info - 微信小程序风格 */}
        <Card className={`bg-white border-0 overflow-hidden transition-all duration-500 ${isChangingFamily ? 'ring-4 ring-green-300 shadow-2xl' : ''} ${deviceType === "mobile" ? "rounded-xl shadow-sm" : "rounded-2xl shadow-md"}`}>
          <CardHeader className={`bg-gradient-to-r from-blue-500 to-blue-600 text-white flex flex-row items-center justify-between space-y-0 ${deviceType === "mobile" ? "px-4 py-3" : "px-6 py-4"}`}>
            <div className="flex items-center gap-2">
              <Calendar className={`${deviceType === "mobile" ? "h-4 w-4" : "h-5 w-5"} text-white/90`} />
              <span className={`font-semibold text-white ${deviceType === "mobile" ? "text-base" : "text-lg"}`}>
                当前服务信息
              </span>
            </div>
            {isChangingFamily && (
              <div className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                已切换家庭
              </div>
            )}
          </CardHeader>
          <CardContent className={`${deviceType === "mobile" ? "px-4 py-4" : "px-6 py-5"}`}>
            {/* 家庭信息卡片 */}
            <div className="bg-blue-50/50 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">{currentAppointment.patientName}</h3>
                  <p className="text-gray-600 text-sm">家庭户主</p>
                </div>
                <Badge className={`${getPaymentStatusColor(currentAppointment.paymentStatus)} px-3 py-1 text-xs font-medium`}>
                  {getPaymentStatusText(currentAppointment.paymentStatus)}
                </Badge>
              </div>
            </div>

            {/* 服务详情 */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FileText className="h-5 w-5 text-gray-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{currentAppointment.serviceType}</p>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {currentAppointment.date} {currentAppointment.time}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-900 leading-relaxed">{currentAppointment.location}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Package className="h-5 w-5 text-gray-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{currentAppointment.packageType}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>


        <Card className={`bg-white border-0 overflow-hidden transition-all duration-500 ${isChangingFamily ? 'ring-4 ring-green-300 shadow-2xl' : ''} ${deviceType === "mobile" ? "rounded-xl shadow-sm" : "rounded-2xl shadow-md"}`}>
          <CardHeader className={`bg-gradient-to-r from-green-500 to-green-600 text-white flex flex-row items-center justify-between space-y-0 ${deviceType === "mobile" ? "px-4 py-3" : "px-6 py-4"}`}>
            <div className="flex items-center gap-2">
              <Users className={`${deviceType === "mobile" ? "h-4 w-4" : "h-5 w-5"} text-white/90`} />
              <CardTitle className={`font-semibold text-white ${deviceType === "mobile" ? "text-base" : "text-lg"}`}>
                家庭成员健康记录
              </CardTitle>
            </div>
            {isChangingFamily && (
              <div className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                数据更新中...
              </div>
            )}
          </CardHeader>
          <CardContent className={`${deviceType === "mobile" ? "px-4 py-4 space-y-4" : "px-6 py-5 space-y-5"}`}>
            {currentFamilyHealth.map((member) => (
              <Card key={member.memberId} className="border border-green-100 bg-green-50/30 rounded-lg overflow-hidden">
                <CardHeader className={`bg-green-50/50 border-b border-green-100 ${deviceType === "mobile" ? "px-3 py-3" : "px-4 py-3"}`}>
                  <CardTitle className={`flex items-center gap-2 ${deviceType === "mobile" ? "text-sm" : "text-base"}`}>
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="font-medium text-gray-900">{member.memberName}</span>
                    <Badge variant="outline" className="text-xs bg-white/80 border-green-200 text-green-700">
                      {member.memberId === "1" ? "女儿" : member.memberId === "2" ? "儿子" : "孙子"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className={`${deviceType === "mobile" ? "px-3 py-4 space-y-3" : "px-4 py-4 space-y-4"}`}>
                  <div className={`grid gap-3 ${deviceType === "mobile" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                      <Label htmlFor={`bp-${member.memberId}`} className={`text-gray-700 font-medium flex items-center gap-2 mb-2 ${deviceType === "mobile" ? "text-xs" : "text-sm"}`}>
                        <Heart className="h-4 w-4 text-red-500" />
                        血压 <span className="text-gray-400 font-normal">(可选)</span>
                      </Label>
                      <Input
                        id={`bp-${member.memberId}`}
                        placeholder="如: 120/80"
                        value={member.bloodPressure || ""}
                        onChange={(e) => updateFamilyMemberHealth(member.memberId, "bloodPressure", e.target.value)}
                        className={`border-gray-200 focus:border-red-300 ${deviceType === "mobile" ? "h-8 text-sm" : "h-9"}`}
                      />
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                      <Label htmlFor={`bs-${member.memberId}`} className={`text-gray-700 font-medium flex items-center gap-2 mb-2 ${deviceType === "mobile" ? "text-xs" : "text-sm"}`}>
                        <Activity className="h-4 w-4 text-blue-500" />
                        血糖 <span className="text-gray-400 font-normal">(可选)</span>
                      </Label>
                      <Input
                        id={`bs-${member.memberId}`}
                        placeholder="如: 6.5"
                        value={member.bloodSugar || ""}
                        onChange={(e) => updateFamilyMemberHealth(member.memberId, "bloodSugar", e.target.value)}
                        className={`border-gray-200 focus:border-blue-300 ${deviceType === "mobile" ? "h-8 text-sm" : "h-9"}`}
                      />
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                      <Label htmlFor={`bm-${member.memberId}`} className={`text-gray-700 font-medium flex items-center gap-2 mb-2 ${deviceType === "mobile" ? "text-xs" : "text-sm"}`}>
                        <Clock className="h-4 w-4 text-orange-500" />
                        排便规律 <span className="text-gray-400 font-normal">(可选)</span>
                      </Label>
                      <Input
                        id={`bm-${member.memberId}`}
                        placeholder="如: 正常/便秘/腹泻"
                        value={member.bowelMovement || ""}
                        onChange={(e) => updateFamilyMemberHealth(member.memberId, "bowelMovement", e.target.value)}
                        className={`border-gray-200 focus:border-orange-300 ${deviceType === "mobile" ? "h-8 text-sm" : "h-9"}`}
                      />
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                      <Label htmlFor={`sq-${member.memberId}`} className={`text-gray-700 font-medium flex items-center gap-2 mb-2 ${deviceType === "mobile" ? "text-xs" : "text-sm"}`}>
                        <Moon className="h-4 w-4 text-purple-500" />
                        睡眠质量 <span className="text-gray-400 font-normal">(可选)</span>
                      </Label>
                      <Input
                        id={`sq-${member.memberId}`}
                        placeholder="如: 良好/一般/差"
                        value={member.sleepQuality || ""}
                        onChange={(e) => updateFamilyMemberHealth(member.memberId, "sleepQuality", e.target.value)}
                        className={`border-gray-200 focus:border-purple-300 ${deviceType === "mobile" ? "h-8 text-sm" : "h-9"}`}
                      />
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <Label htmlFor={`notes-${member.memberId}`} className={`text-gray-700 font-medium flex items-center gap-2 mb-2 ${deviceType === "mobile" ? "text-xs" : "text-sm"}`}>
                      <FileText className="h-4 w-4 text-gray-500" />
                      备注 <span className="text-gray-400 font-normal">(可选)</span>
                    </Label>
                    <Textarea
                      id={`notes-${member.memberId}`}
                      placeholder="其他健康状况或注意事项..."
                      value={member.notes || ""}
                      onChange={(e) => updateFamilyMemberHealth(member.memberId, "notes", e.target.value)}
                      className={`border-gray-200 focus:border-gray-300 resize-none ${deviceType === "mobile" ? "min-h-[50px] text-sm" : "min-h-[60px]"}`}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Family Health Records History - 微信小程序风格 */}
        {familyHealthRecords.length > 0 && (
          <Card className={`bg-white border-0 overflow-hidden ${deviceType === "mobile" ? "rounded-xl shadow-sm" : "rounded-2xl shadow-md"}`}>
            <CardHeader className={`bg-gradient-to-r from-purple-500 to-purple-600 text-white ${deviceType === "mobile" ? "px-4 py-3" : "px-6 py-4"}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className={`${deviceType === "mobile" ? "h-4 w-4" : "h-5 w-5"} text-white/90`} />
                  <span className={`font-medium text-white ${deviceType === "mobile" ? "text-base" : "text-lg"}`}>
                    家庭健康记录历史
                  </span>
                </div>
                <Badge variant="outline" className="bg-white/20 text-white border-white/30 text-xs">
                  {getFilteredHistoryRecords().length} 条记录
                </Badge>
              </div>
              
              {/* 历史记录家庭选择器 */}
              <div className="w-full">
                <FamilySelector
                  selectedFamilyId={historySelectedFamilyId}
                  onFamilySelect={handleHistoryFamilySelect}
                  className="bg-white/10 backdrop-blur-sm border-white/20"
                />
              </div>
            </CardHeader>
            <CardContent className={`${deviceType === "mobile" ? "px-4 py-4 space-y-3" : "px-6 py-5 space-y-4"}`}>
              {getFilteredHistoryRecords().map((record) => (
                <Card key={record.recordId} className="border border-gray-100">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {record.date} {record.time}
                          </span>
                          {record.familyName && (
                            <span className="text-xs text-gray-500">
                              家庭: {record.familyName}
                            </span>
                          )}
                        </div>
                        {(record as any).uploadStatus === "uploaded" && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
                            已上传
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        {record.isEditable ? (
                          <Button
                            size="sm"
                            onClick={() => saveFamilyHealthRecord(record.recordId)}
                            className="text-xs px-2 py-1 h-7 w-full justify-start"
                          >
                            <Save className="h-3 w-3 mr-1" />
                            保存
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => editFamilyHealthRecord(record.recordId)}
                            className="text-xs px-2 py-1 h-7 w-full justify-start border-blue-200 text-blue-600 hover:bg-blue-50"
                          >
                            <Edit3 className="h-3 w-3 mr-1" />
                            编辑
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleRecordExpanded(record.recordId)}
                          className="text-xs px-2 py-1 h-7 w-full justify-start border-purple-200 text-purple-600 hover:bg-purple-50"
                        >
                          {expandedRecords.has(record.recordId) ? (
                            <ChevronUp className="h-3 w-3 mr-1" />
                          ) : (
                            <ChevronDown className="h-3 w-3 mr-1" />
                          )}
                          {expandedRecords.has(record.recordId) ? '收起' : '详细'}
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            console.log('上传语音:', record.recordId)
                            // 暂时不加功能
                          }}
                          className="text-xs px-2 py-1 h-7 w-full justify-start border-orange-200 text-orange-600 hover:bg-orange-50"
                        >
                          <Upload className="h-3 w-3 mr-1" />
                          上传语音
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteFamilyHealthRecord(record.recordId)}
                          className="text-xs px-2 py-1 h-7 w-full justify-start border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          删除
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {expandedRecords.has(record.recordId) && (
                    <CardContent className="space-y-4">
                      {record.familyMembers.map((member) => (
                        <div key={member.memberId} className="border border-gray-100 rounded-lg p-3 bg-gray-50/50">
                        <div className="space-y-2 mb-4">
                          {/* 成员基本信息 */}
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-600" />
                            <span className="font-medium text-lg">{member.memberName}</span>
                          </div>
                          
                          {/* 成员详细信息 */}
                          {(member.memberAge || member.memberGender || member.memberRelationship || member.memberPackageType || 
                            (member.memberConditions && member.memberConditions.length > 0) || 
                            (member.memberMedications && member.memberMedications.length > 0)) && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm bg-blue-50/50 rounded-lg p-3">
                              {member.memberAge && (
                                <div>
                                  <span className="text-gray-600">年龄:</span>
                                  <span className="ml-1 font-medium">{member.memberAge}岁</span>
                                </div>
                              )}
                              {member.memberGender && (
                                <div>
                                  <span className="text-gray-600">性别:</span>
                                  <span className="ml-1 font-medium">{member.memberGender}</span>
                                </div>
                              )}
                              {member.memberRelationship && (
                                <div>
                                  <span className="text-gray-600">关系:</span>
                                  <span className="ml-1 font-medium">{member.memberRelationship}</span>
                                </div>
                              )}
                              {member.memberPackageType && (
                                <div>
                                  <span className="text-gray-600">套餐:</span>
                                  <span className="ml-1 font-medium">{member.memberPackageType}</span>
                                </div>
                              )}
                              {member.memberConditions && member.memberConditions.length > 0 && (
                                <div className="col-span-2 md:col-span-4">
                                  <span className="text-gray-600">病症:</span>
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {member.memberConditions.map((condition, index) => (
                                      <span key={index} className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
                                        {condition}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {member.memberMedications && member.memberMedications.length > 0 && (
                                <div className="col-span-2 md:col-span-4">
                                  <span className="text-gray-600">用药:</span>
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {member.memberMedications.map((medication, index) => (
                                      <span key={index} className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                                        {medication}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {record.isEditable ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs text-gray-600">血压</Label>
                              <Input
                                value={member.bloodPressure || ""}
                                onChange={(e) =>
                                  updateExistingFamilyRecord(
                                    record.recordId,
                                    member.memberId,
                                    "bloodPressure",
                                    e.target.value,
                                  )
                                }
                                className="h-8 text-sm"
                                placeholder="如: 120/80"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-gray-600">血糖</Label>
                              <Input
                                value={member.bloodSugar || ""}
                                onChange={(e) =>
                                  updateExistingFamilyRecord(
                                    record.recordId,
                                    member.memberId,
                                    "bloodSugar",
                                    e.target.value,
                                  )
                                }
                                className="h-8 text-sm"
                                placeholder="如: 6.5"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-gray-600">排便规律</Label>
                              <Input
                                value={member.bowelMovement || ""}
                                onChange={(e) =>
                                  updateExistingFamilyRecord(
                                    record.recordId,
                                    member.memberId,
                                    "bowelMovement",
                                    e.target.value,
                                  )
                                }
                                className="h-8 text-sm"
                                placeholder="如: 正常"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-gray-600">睡眠质量</Label>
                              <Input
                                value={member.sleepQuality || ""}
                                onChange={(e) =>
                                  updateExistingFamilyRecord(
                                    record.recordId,
                                    member.memberId,
                                    "sleepQuality",
                                    e.target.value,
                                  )
                                }
                                className="h-8 text-sm"
                                placeholder="如: 良好"
                              />
                            </div>
                            <div className="space-y-1 md:col-span-2">
                              <Label className="text-xs text-gray-600">备注</Label>
                              <Textarea
                                value={member.notes || ""}
                                onChange={(e) =>
                                  updateExistingFamilyRecord(record.recordId, member.memberId, "notes", e.target.value)
                                }
                                className="min-h-[50px] text-sm resize-none"
                                placeholder="其他健康状况..."
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <span className="text-gray-600">血压:</span>
                              <span className={cn(
                                "ml-1",
                                member.bloodPressure ? "font-medium text-gray-900" : "text-gray-400 italic"
                              )}>
                                {member.bloodPressure || "未填写"}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">血糖:</span>
                              <span className={cn(
                                "ml-1",
                                member.bloodSugar ? "font-medium text-gray-900" : "text-gray-400 italic"
                              )}>
                                {member.bloodSugar || "未填写"}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">排便:</span>
                              <span className={cn(
                                "ml-1",
                                member.bowelMovement ? "font-medium text-gray-900" : "text-gray-400 italic"
                              )}>
                                {member.bowelMovement || "未填写"}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">睡眠:</span>
                              <span className={cn(
                                "ml-1",
                                member.sleepQuality ? "font-medium text-gray-900" : "text-gray-400 italic"
                              )}>
                                {member.sleepQuality || "未填写"}
                              </span>
                            </div>
                            <div className="col-span-2 md:col-span-4">
                              <span className="text-gray-600">备注:</span>
                              <span className={cn(
                                "ml-1 block mt-1",
                                member.notes ? "text-gray-900" : "text-gray-400 italic"
                              )}>
                                {member.notes || "未填写"}
                              </span>
                            </div>
                          </div>
                        )}
                        </div>
                      ))}
                    </CardContent>
                  )}
                </Card>
              ))}
            </CardContent>
          </Card>
        )}


      </div>

      <BottomNavigation activeTab="records" />
      </div>
    </ProtectedRoute>
  )
}
