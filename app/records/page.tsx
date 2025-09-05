"use client"

import { useState, useEffect, useRef } from "react"
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
  const audioUrlRef = useRef<string | null>(null)

  const getFamilyMembersForPatient = (patientName: string | null) => {
    const familyData: { [key: string]: FamilyMemberHealth[] } = {
      张明: [
        { memberId: "1", memberName: "张明", bloodPressure: "", bloodSugar: "", bowelMovement: "", sleepQuality: "" },
        { memberId: "2", memberName: "张丽", bloodPressure: "", bloodSugar: "", bowelMovement: "", sleepQuality: "" },
        { memberId: "3", memberName: "张小宝", bloodPressure: "", bloodSugar: "", bowelMovement: "", sleepQuality: "" },
      ],
      李华: [
        { memberId: "1", memberName: "李华", bloodPressure: "", bloodSugar: "", bowelMovement: "", sleepQuality: "" },
        { memberId: "2", memberName: "李红", bloodPressure: "", bloodSugar: "", bowelMovement: "", sleepQuality: "" },
        { memberId: "3", memberName: "李刚", bloodPressure: "", bloodSugar: "", bowelMovement: "", sleepQuality: "" },
      ],
      李强: [
        { memberId: "1", memberName: "李强", bloodPressure: "", bloodSugar: "", bowelMovement: "", sleepQuality: "" },
        { memberId: "2", memberName: "张丽华", bloodPressure: "", bloodSugar: "", bowelMovement: "", sleepQuality: "" },
        { memberId: "3", memberName: "李小明", bloodPressure: "", bloodSugar: "", bowelMovement: "", sleepQuality: "" },
      ],
      王奶奶: [
        { memberId: "1", memberName: "王秀英", bloodPressure: "", bloodSugar: "", bowelMovement: "", sleepQuality: "" },
        { memberId: "2", memberName: "王建华", bloodPressure: "", bloodSugar: "", bowelMovement: "", sleepQuality: "" },
      ],
      陈爷爷: [
        { memberId: "1", memberName: "陈建国", bloodPressure: "", bloodSugar: "", bowelMovement: "", sleepQuality: "" },
        { memberId: "2", memberName: "陈美华", bloodPressure: "", bloodSugar: "", bowelMovement: "", sleepQuality: "" },
      ],
    }

    console.log("[Records] 查找家庭成员数据，传入名称:", patientName)
    console.log("[Records] 可用的家庭数据键:", Object.keys(familyData))
    const result = familyData[patientName || ""] || [
      { memberId: "1", memberName: "李红", bloodPressure: "", bloodSugar: "", bowelMovement: "", sleepQuality: "" },
      { memberId: "2", memberName: "李刚", bloodPressure: "", bloodSugar: "", bowelMovement: "", sleepQuality: "" },
      { memberId: "3", memberName: "李博", bloodPressure: "", bloodSugar: "", bowelMovement: "", sleepQuality: "" },
    ]
    console.log("[Records] 返回的家庭成员数据:", result)
    return result
  }

  const [currentFamilyHealth, setCurrentFamilyHealth] = useState<FamilyMemberHealth[]>(() =>
    getFamilyMembersForPatient(familyName || patientName),
  )

  const getCurrentAppointmentData = (): CurrentAppointment => {
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
      陈爷爷: 78,
    }
    return ageData[patientName || ""] || 79
  }

  const getPackageType = (patientName: string | null): string => {
    const packageData: { [key: string]: string } = {
      张明: "基础护理套餐",
      李华: "综合护理套餐",
      王奶奶: "高级护理套餐",
      陈爷爷: "康复护理套餐",
    }
    return packageData[patientName || ""] || "高级护理套餐"
  }

  const currentAppointment = getCurrentAppointmentData()

  useEffect(() => {
    setCurrentFamilyHealth(getFamilyMembersForPatient(familyName || patientName))
  }, [familyName, patientName])

  const [isEditingFamilyHealth, setIsEditingFamilyHealth] = useState(true) // Default to true so it's always expanded

  // Audio recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  const isMobile = useIsMobile()
  const deviceType = useDeviceType()
  const [currentTab, setCurrentTab] = useState("all")

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
    const savedFamilyRecords = localStorage.getItem("familyHealthRecords")
    if (savedFamilyRecords) {
      try {
        setFamilyHealthRecords(JSON.parse(savedFamilyRecords))
      } catch (error) {
        console.error("[v0] Error loading family health records:", error)
      }
    }
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
        setCurrentFamilyHealth(getFamilyMembersForPatient(patientName))
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
    setFamilyHealthRecords((prev) =>
      prev.map((record) => (record.recordId === recordId ? { ...record, isEditable: true } : record)),
    )
  }

  const saveFamilyHealthRecord = (recordId: string) => {
    setFamilyHealthRecords((prev) => {
      const updated = prev.map((record) => (record.recordId === recordId ? { ...record, isEditable: false } : record))
      localStorage.setItem("familyHealthRecords", JSON.stringify(updated))
      return updated
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

  // Combine local records with mock historical records
  const allRecords = [...localRecords, ...mockHistoricalRecords]

  // Filter records based on current tab
  const getFilteredRecords = () => {
    switch (currentTab) {
      case "pending":
        return allRecords.filter(r => r.uploadStatus === "pending" || r.uploadStatus === "failed")
      case "uploaded":
        return allRecords.filter(r => r.uploadStatus === "uploaded")
      case "drafts":
        return allRecords.filter(r => r.status === "draft")
      default:
        return allRecords
    }
  }

  const filteredRecords = getFilteredRecords()

  // Calculate stats for header
  const recordStats = {
    total: allRecords.length,
    pending: allRecords.filter(r => r.uploadStatus === "pending" || r.uploadStatus === "failed").length,
    uploaded: allRecords.filter(r => r.uploadStatus === "uploaded").length,
    drafts: allRecords.filter(r => r.status === "draft").length,
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

      <div className={`space-y-3 ${deviceType === "mobile" ? "px-3 py-3" : deviceType === "tablet" ? "px-4 py-4" : "px-6 py-6 max-w-5xl mx-auto"}`}>

        {/* Current Appointment Info - 微信小程序风格 */}
        <Card className={`bg-white border-0 overflow-hidden ${deviceType === "mobile" ? "rounded-xl shadow-sm" : "rounded-2xl shadow-md"}`}>
          <CardHeader className={`bg-gradient-to-r from-blue-500 to-blue-600 text-white ${deviceType === "mobile" ? "px-4 py-3" : "px-6 py-4"}`}>
            <CardTitle className={`flex items-center gap-2 ${deviceType === "mobile" ? "text-base" : "text-lg"}`}>
              <Calendar className={`${deviceType === "mobile" ? "h-4 w-4" : "h-5 w-5"} text-white/90`} />
              当前服务信息
            </CardTitle>
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

        {/* Recording Section - 微信小程序风格 */}
        <Card className={`bg-white border-0 overflow-hidden ${deviceType === "mobile" ? "rounded-xl shadow-sm" : "rounded-2xl shadow-md"}`}>
          <CardContent className={`${deviceType === "mobile" ? "p-4" : "p-6"}`}>
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Mic className="h-4 w-4 text-green-600" />
                </div>
                <h3 className={`font-semibold text-gray-800 ${deviceType === "mobile" ? "text-base" : "text-lg"}`}>
                  健康信息记录
                </h3>
              </div>

              {/* 录音状态显示 */}
              {isRecording && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-700 font-medium">正在录音...</span>
                  </div>
                  <div className="text-2xl font-mono text-red-600">
                    {formatTime(recordingTime)}
                  </div>
                </div>
              )}

              {/* 录音错误提示 */}
              {recordingError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{recordingError}</span>
                  </div>
                </div>
              )}

              <Button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={audioPermission === "denied"}
                className={`w-full transition-all duration-300 ${deviceType === "mobile" ? "py-4 text-base rounded-lg" : "py-5 text-lg rounded-xl"} font-medium ${
                  isRecording 
                    ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25" 
                    : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/25"
                } ${audioPermission === "denied" ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isRecording ? (
                  <>
                    <Square className={`${deviceType === "mobile" ? "h-4 w-4" : "h-5 w-5"} mr-2`} />
                    结束记录
                  </>
                ) : (
                  <>
                    <Mic className={`${deviceType === "mobile" ? "h-4 w-4" : "h-5 w-5"} mr-2`} />
                    开始记录
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-white border-0 overflow-hidden ${deviceType === "mobile" ? "rounded-xl shadow-sm" : "rounded-2xl shadow-md"}`}>
          <CardHeader className={`bg-gradient-to-r from-green-500 to-green-600 text-white flex flex-row items-center justify-between space-y-0 ${deviceType === "mobile" ? "px-4 py-3" : "px-6 py-4"}`}>
            <div className="flex items-center gap-2">
              <Users className={`${deviceType === "mobile" ? "h-4 w-4" : "h-5 w-5"} text-white/90`} />
              <CardTitle className={`font-semibold text-white ${deviceType === "mobile" ? "text-base" : "text-lg"}`}>
                家庭成员健康记录
              </CardTitle>
            </div>
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className={`${deviceType === "mobile" ? "h-4 w-4" : "h-5 w-5"} text-white/90`} />
                  <span className={`font-medium text-white ${deviceType === "mobile" ? "text-base" : "text-lg"}`}>
                    家庭健康记录历史
                  </span>
                </div>
                <Badge variant="outline" className="bg-white/20 text-white border-white/30 text-xs">
                  {familyHealthRecords.length} 条记录
                </Badge>
              </div>
            </CardHeader>
            <CardContent className={`${deviceType === "mobile" ? "px-4 py-4 space-y-3" : "px-6 py-5 space-y-4"}`}>
              {familyHealthRecords.map((record) => (
                <Card key={record.recordId} className="border border-gray-100">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">
                          {record.date} {record.time}
                        </span>
                        {(record as any).uploadStatus === "uploaded" && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
                            已上传
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {record.isEditable && !(record as any).uploadStatus ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => saveFamilyHealthRecord(record.recordId)}
                              className="text-xs"
                            >
                              <Save className="h-3 w-3 mr-1" />
                              保存
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => uploadRecord(record.recordId)}
                              className="text-xs bg-green-600 hover:bg-green-700"
                            >
                              <Upload className="h-3 w-3 mr-1" />
                              上传
                            </Button>
                          </>
                        ) : (record as any).uploadStatus !== "uploaded" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => editFamilyHealthRecord(record.recordId)}
                            className="text-xs"
                          >
                            <Edit3 className="h-3 w-3 mr-1" />
                            编辑
                          </Button>
                        ) : (
                          <Badge variant="outline" className="text-xs text-gray-500">
                            已锁定
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {record.familyMembers.map((member) => (
                      <div key={member.memberId} className="border border-gray-100 rounded-lg p-3 bg-gray-50/50">
                        <div className="flex items-center gap-2 mb-3">
                          <User className="h-4 w-4 text-gray-600" />
                          <span className="font-medium">{member.memberName}</span>
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
                            {member.bloodPressure && (
                              <div>
                                <span className="text-gray-600">血压:</span>
                                <span className="ml-1 font-medium">{member.bloodPressure}</span>
                              </div>
                            )}
                            {member.bloodSugar && (
                              <div>
                                <span className="text-gray-600">血糖:</span>
                                <span className="ml-1 font-medium">{member.bloodSugar}</span>
                              </div>
                            )}
                            {member.bowelMovement && (
                              <div>
                                <span className="text-gray-600">排便:</span>
                                <span className="ml-1 font-medium">{member.bowelMovement}</span>
                              </div>
                            )}
                            {member.sleepQuality && (
                              <div>
                                <span className="text-gray-600">睡眠:</span>
                                <span className="ml-1 font-medium">{member.sleepQuality}</span>
                              </div>
                            )}
                            {member.notes && (
                              <div className="col-span-2 md:col-span-4">
                                <span className="text-gray-600">备注:</span>
                                <span className="ml-1">{member.notes}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Tab 切换 */}
        <div className={`bg-white border-0 overflow-hidden ${deviceType === "mobile" ? "rounded-xl shadow-sm" : "rounded-2xl shadow-md"}`}>
          <div className={`${deviceType === "mobile" ? "px-4 py-3" : "px-6 py-4"}`}>
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setCurrentTab("all")}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentTab === "all"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                全部
                <span className={`ml-1 text-xs ${currentTab === "all" ? "text-blue-500" : "text-gray-400"}`}>
                  {allRecords.length}
                </span>
              </button>
              
              <button
                onClick={() => setCurrentTab("pending")}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentTab === "pending"
                    ? "bg-white text-orange-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                待上传
                <span className={`ml-1 text-xs ${currentTab === "pending" ? "text-orange-500" : "text-gray-400"}`}>
                  {recordStats.pending}
                </span>
              </button>
              
              <button
                onClick={() => setCurrentTab("uploaded")}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentTab === "uploaded"
                    ? "bg-white text-green-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                已上传
                <span className={`ml-1 text-xs ${currentTab === "uploaded" ? "text-green-500" : "text-gray-400"}`}>
                  {recordStats.uploaded}
                </span>
              </button>
              
              <button
                onClick={() => setCurrentTab("drafts")}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentTab === "drafts"
                    ? "bg-white text-purple-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                草稿
                <span className={`ml-1 text-xs ${currentTab === "drafts" ? "text-purple-500" : "text-gray-400"}`}>
                  {recordStats.drafts}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Historical Records - 微信小程序风格 */}
        <Card className={`bg-white border-0 overflow-hidden ${deviceType === "mobile" ? "rounded-xl shadow-sm" : "rounded-2xl shadow-md"}`}>
          <CardHeader className={`bg-gradient-to-r from-indigo-500 to-indigo-600 text-white ${deviceType === "mobile" ? "px-4 py-3" : "px-6 py-4"}`}>
            <CardTitle className={`flex items-center justify-between ${deviceType === "mobile" ? "text-base" : "text-lg"}`}>
              <div className="flex items-center gap-2">
                <Activity className={`${deviceType === "mobile" ? "h-4 w-4" : "h-5 w-5"} text-white/90`} />
                <span className="text-white font-medium">
                  家庭记录列表
                </span>
              </div>
              <Badge variant="outline" className="bg-white/20 text-white border-white/30 text-xs">
                {filteredRecords.length} 条记录
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className={`${deviceType === "mobile" ? "px-4 py-4 space-y-3" : "px-6 py-5 space-y-4"}`}>
            {filteredRecords.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-base mb-2">
                  {currentTab === "all" ? "暂无记录" :
                   currentTab === "pending" ? "暂无待上传记录" :
                   currentTab === "uploaded" ? "暂无已上传记录" : "暂无草稿记录"}
                </p>
                <p className="text-gray-400 text-sm">点击上方按钮开始记录健康信息</p>
              </div>
            ) : (
              filteredRecords.map((record) => (
                <Card key={record.id} className={`border border-gray-100 bg-white hover:shadow-md transition-all duration-200 ${deviceType === "mobile" ? "rounded-lg" : "rounded-xl"}`}>
                  <CardContent className={`${deviceType === "mobile" ? "p-4" : "p-5"}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-semibold text-gray-900 ${deviceType === "mobile" ? "text-sm" : "text-base"} mb-1`}>
                            {record.serviceType}
                          </h4>
                          <div className="flex items-center gap-2 text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span className={`${deviceType === "mobile" ? "text-xs" : "text-sm"}`}>
                              {record.date} {record.time}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={`${getStatusColor(record.status)} text-xs px-2 py-1`}>
                            {getStatusText(record.status)}
                          </Badge>
                          {localRecords.some((lr) => lr.id === record.id) && (
                            <Badge variant="outline" className={`${getUploadStatusColor(record.uploadStatus)} text-xs px-2 py-1`}>
                              <div className="flex items-center gap-1">
                                {getUploadStatusIcon(record.uploadStatus)}
                                <span className={`${deviceType === "mobile" ? "hidden" : ""}`}>
                                  {getUploadStatusText(record.uploadStatus)}
                                </span>
                              </div>
                            </Badge>
                          )}
                        </div>
                        
                        {localRecords.some((lr) => lr.id === record.id) && (
                          <div className="flex gap-1">
                            {(record.uploadStatus === "pending" || record.uploadStatus === "failed") && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => uploadRecord(record.id)}
                                disabled={uploadingRecords.has(record.id)}
                                className={`${deviceType === "mobile" ? "w-8 h-8 p-0" : "text-xs px-2 py-1 h-7"} border-blue-200 text-blue-600 hover:bg-blue-50`}
                              >
                                {uploadingRecords.has(record.id) ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Upload className="h-3 w-3" />
                                )}
                                {deviceType !== "mobile" && <span className="ml-1">上传</span>}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteRecord(record.id)}
                              className={`${deviceType === "mobile" ? "w-8 h-8 p-0" : "text-xs px-2 py-1 h-7"} border-red-200 text-red-600 hover:bg-red-50`}
                            >
                              <Trash2 className="h-3 w-3" />
                              {deviceType !== "mobile" && <span className="ml-1">删除</span>}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 地址信息 */}
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg mb-3">
                      <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                      <span className={`text-gray-700 ${deviceType === "mobile" ? "text-xs" : "text-sm"} leading-relaxed`}>
                        {record.location}
                      </span>
                    </div>

                    {/* 生命体征 */}
                    {Object.keys(record.vitals).length > 0 && (
                      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="h-4 w-4 text-blue-600" />
                          <span className={`font-medium text-gray-900 ${deviceType === "mobile" ? "text-xs" : "text-sm"}`}>
                            生命体征
                          </span>
                        </div>
                        <div className={`grid gap-2 ${deviceType === "mobile" ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"}`}>
                          {record.vitals.bloodPressure && (
                            <div className="bg-white rounded-md px-2 py-1 flex items-center gap-1">
                              <Heart className="h-3 w-3 text-red-500" />
                              <span className={`text-gray-900 ${deviceType === "mobile" ? "text-xs" : "text-sm"} font-medium`}>
                                {record.vitals.bloodPressure}
                              </span>
                            </div>
                          )}
                          {record.vitals.heartRate && (
                            <div className="bg-white rounded-md px-2 py-1 flex items-center gap-1">
                              <Activity className="h-3 w-3 text-blue-500" />
                              <span className={`text-gray-900 ${deviceType === "mobile" ? "text-xs" : "text-sm"} font-medium`}>
                                {record.vitals.heartRate}bpm
                              </span>
                            </div>
                          )}
                          {record.vitals.temperature && (
                            <div className="bg-white rounded-md px-2 py-1 flex items-center gap-1">
                              <Thermometer className="h-3 w-3 text-orange-500" />
                              <span className={`text-gray-900 ${deviceType === "mobile" ? "text-xs" : "text-sm"} font-medium`}>
                                {record.vitals.temperature}°C
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 观察记录 */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className={`text-gray-700 ${deviceType === "mobile" ? "text-xs" : "text-sm"} leading-relaxed`}>
                        {record.observations}
                      </p>
                    </div>

                    {/* 媒体和操作 */}
                    <div className={`flex items-center justify-between pt-3 border-t border-gray-100 ${deviceType === "mobile" ? "text-xs" : "text-sm"}`}>
                      <div className="flex items-center gap-4 text-gray-500">
                        {record.photos.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Camera className="h-3 w-3" />
                            <span>{record.photos.length}张照片</span>
                          </div>
                        )}
                        {record.audioNotes.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Mic className="h-3 w-3" />
                            <span>{record.audioNotes.length}段录音</span>
                          </div>
                        )}
                        {record.recordingDuration && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(record.recordingDuration)}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {record.audioRecording && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => playAudio(record.audioRecording!)}
                            className={`${deviceType === "mobile" ? "h-6 w-6 p-0" : "h-7 px-2"} text-blue-600 hover:bg-blue-50`}
                          >
                            <Play className="h-3 w-3" />
                            {deviceType !== "mobile" && <span className="ml-1">播放</span>}
                          </Button>
                        )}
                        {record.uploadedAt && (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            {deviceType !== "mobile" && <span>已同步</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <BottomNavigation activeTab="records" />
      </div>
    </ProtectedRoute>
  )
}
