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
  const patientName = searchParams.get("patientName")
  const service = searchParams.get("service")
  const time = searchParams.get("time")
  const address = searchParams.get("address")
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
      王奶奶: [
        { memberId: "1", memberName: "王秀英", bloodPressure: "", bloodSugar: "", bowelMovement: "", sleepQuality: "" },
        { memberId: "2", memberName: "王建华", bloodPressure: "", bloodSugar: "", bowelMovement: "", sleepQuality: "" },
      ],
      陈爷爷: [
        { memberId: "1", memberName: "陈建国", bloodPressure: "", bloodSugar: "", bowelMovement: "", sleepQuality: "" },
        { memberId: "2", memberName: "陈美华", bloodPressure: "", bloodSugar: "", bowelMovement: "", sleepQuality: "" },
      ],
    }

    return (
      familyData[patientName || ""] || [
        { memberId: "1", memberName: "李红", bloodPressure: "", bloodSugar: "", bowelMovement: "", sleepQuality: "" },
        { memberId: "2", memberName: "李刚", bloodPressure: "", bloodSugar: "", bowelMovement: "", sleepQuality: "" },
        { memberId: "3", memberName: "李博", bloodPressure: "", bloodSugar: "", bowelMovement: "", sleepQuality: "" },
      ]
    )
  }

  const [currentFamilyHealth, setCurrentFamilyHealth] = useState<FamilyMemberHealth[]>(() =>
    getFamilyMembersForPatient(patientName),
  )

  const getCurrentAppointmentData = (): CurrentAppointment => {
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
    setCurrentFamilyHealth(getFamilyMembersForPatient(patientName))
  }, [patientName])

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

        if (patientId) {
          const completedAppointments = JSON.parse(localStorage.getItem("completedAppointments") || "[]")
          if (!completedAppointments.includes(patientId)) {
            completedAppointments.push(patientId)
            localStorage.setItem("completedAppointments", JSON.stringify(completedAppointments))
          }
        }

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
    <div className={`min-h-screen bg-gradient-to-br from-blue-50/30 to-indigo-50/30 ${deviceType === "mobile" ? "pb-24" : deviceType === "tablet" ? "pb-22" : "pb-20"}`}>
      {/* 微信风格的记录页头部 */}
      <WechatRecordHeader
        title="患者记录"
        subtitle="记录和管理患者健康信息"
        stats={recordStats}
        activeTab={currentTab}
        onTabChange={setCurrentTab}
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

      <div className={`space-y-6 ${deviceType === "mobile" ? "px-4 py-6" : deviceType === "tablet" ? "px-5 py-6" : "px-6 py-8 max-w-4xl mx-auto"}`}>

        {/* Current Appointment Info */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              当前日程信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">{currentAppointment.patientName}</p>
                    <p className="text-sm text-gray-600">{currentAppointment.patientAge}岁</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">{currentAppointment.serviceType}</p>
                    <p className="text-sm text-gray-600">
                      {currentAppointment.date} {currentAppointment.time}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <p className="text-sm">{currentAppointment.location}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Package className="h-4 w-4 text-gray-500" />
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{currentAppointment.packageType}</span>
                    <Badge className={getPaymentStatusColor(currentAppointment.paymentStatus)}>
                      {getPaymentStatusText(currentAppointment.paymentStatus)}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recording Section */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">健康信息记录</h3>

              <Button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={audioPermission === "denied"}
                className={`w-full py-4 text-lg font-medium rounded-xl transition-all duration-300 ${
                  isRecording ? "bg-red-500 hover:bg-red-600 text-white" : "bg-primary hover:bg-primary/90 text-white"
                } ${audioPermission === "denied" ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isRecording ? (
                  <>
                    <Square className="h-5 w-5 mr-2" />
                    结束记录
                  </>
                ) : (
                  <>
                    <Mic className="h-5 w-5 mr-2" />
                    开始记录
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg font-semibold text-gray-900">家庭成员健康记录</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentFamilyHealth.map((member) => (
              <Card key={member.memberId} className="border border-blue-100 bg-blue-50/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    {member.memberName}
                    <Badge variant="outline" className="text-xs">
                      {member.memberId === "1" ? "女儿" : member.memberId === "2" ? "儿子" : "孙子"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`bp-${member.memberId}`} className="text-sm font-medium">
                        血压 <span className="text-gray-400">(可选)</span>
                      </Label>
                      <Input
                        id={`bp-${member.memberId}`}
                        placeholder="如: 120/80"
                        value={member.bloodPressure || ""}
                        onChange={(e) => updateFamilyMemberHealth(member.memberId, "bloodPressure", e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`bs-${member.memberId}`} className="text-sm font-medium">
                        血糖 <span className="text-gray-400">(可选)</span>
                      </Label>
                      <Input
                        id={`bs-${member.memberId}`}
                        placeholder="如: 6.5"
                        value={member.bloodSugar || ""}
                        onChange={(e) => updateFamilyMemberHealth(member.memberId, "bloodSugar", e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`bm-${member.memberId}`} className="text-sm font-medium">
                        排便规律 <span className="text-gray-400">(可选)</span>
                      </Label>
                      <Input
                        id={`bm-${member.memberId}`}
                        placeholder="如: 正常/便秘/腹泻"
                        value={member.bowelMovement || ""}
                        onChange={(e) => updateFamilyMemberHealth(member.memberId, "bowelMovement", e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`sq-${member.memberId}`} className="text-sm font-medium">
                        睡眠质量 <span className="text-gray-400">(可选)</span>
                      </Label>
                      <Input
                        id={`sq-${member.memberId}`}
                        placeholder="如: 良好/一般/差"
                        value={member.sleepQuality || ""}
                        onChange={(e) => updateFamilyMemberHealth(member.memberId, "sleepQuality", e.target.value)}
                        className="h-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`notes-${member.memberId}`} className="text-sm font-medium">
                      备注 <span className="text-gray-400">(可选)</span>
                    </Label>
                    <Textarea
                      id={`notes-${member.memberId}`}
                      placeholder="其他健康状况或注意事项..."
                      value={member.notes || ""}
                      onChange={(e) => updateFamilyMemberHealth(member.memberId, "notes", e.target.value)}
                      className="min-h-[60px] resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Family Health Records History */}
        {familyHealthRecords.length > 0 && (
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="font-medium">家庭健康记录历史</span>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {familyHealthRecords.length} 条记录
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
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

        {/* Historical Records */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                {currentTab === "all" ? "全部记录" : 
                 currentTab === "pending" ? "待上传记录" :
                 currentTab === "uploaded" ? "已上传记录" : "草稿记录"}
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {filteredRecords.length} 条记录
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500">
                  {currentTab === "all" ? "暂无记录" :
                   currentTab === "pending" ? "暂无待上传记录" :
                   currentTab === "uploaded" ? "暂无已上传记录" : "暂无草稿记录"}
                </p>
              </div>
            ) : (
              filteredRecords.map((record) => (
                <Card key={record.id} className="border border-gray-100 hover:border-gray-200 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <div>
                          <span className="font-medium">{record.serviceType}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {record.date} {record.time}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getStatusColor(record.status)}>
                          {getStatusText(record.status)}
                        </Badge>
                        {localRecords.some((lr) => lr.id === record.id) && (
                          <>
                            <Badge variant="outline" className={getUploadStatusColor(record.uploadStatus)}>
                              <div className="flex items-center gap-1">
                                {getUploadStatusIcon(record.uploadStatus)}
                                {getUploadStatusText(record.uploadStatus)}
                              </div>
                            </Badge>
                            <div className="flex gap-1">
                              {(record.uploadStatus === "pending" || record.uploadStatus === "failed") && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => uploadRecord(record.id)}
                                  disabled={uploadingRecords.has(record.id)}
                                  className="text-xs"
                                >
                                  {uploadingRecords.has(record.id) ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Upload className="h-3 w-3" />
                                  )}
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteRecord(record.id)}
                                className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-600">{record.location}</span>
                      </div>

                      {Object.keys(record.vitals).length > 0 && (
                        <div className="flex items-center gap-4 mt-2">
                          {record.vitals.bloodPressure && (
                            <div className="flex items-center gap-1">
                              <Heart className="h-3 w-3 text-red-500" />
                              <span className="text-xs">{record.vitals.bloodPressure}</span>
                            </div>
                          )}
                          {record.vitals.heartRate && (
                            <div className="flex items-center gap-1">
                              <Activity className="h-3 w-3 text-blue-500" />
                              <span className="text-xs">{record.vitals.heartRate}bpm</span>
                            </div>
                          )}
                          {record.vitals.temperature && (
                            <div className="flex items-center gap-1">
                              <Thermometer className="h-3 w-3 text-orange-500" />
                              <span className="text-xs">{record.vitals.temperature}°C</span>
                            </div>
                          )}
                        </div>
                      )}

                      <p className="text-gray-700 text-sm leading-relaxed">{record.observations}</p>

                      <div className="flex items-center gap-4 pt-2 border-t text-xs text-gray-500">
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
                        {record.audioRecording && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => playAudio(record.audioRecording!)}
                            className="h-6 px-2 text-xs"
                          >
                            <Play className="h-3 w-3 mr-1" />
                            播放
                          </Button>
                        )}
                        {record.uploadedAt && (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            <span>已同步</span>
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
  )
}
