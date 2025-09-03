"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  FileText,
  Clock,
  MapPin,
  User,
  Heart,
  Activity,
  Thermometer,
  Droplets,
  Mic,
  Square,
  Play,
  Pause,
  Save,
  ArrowLeft,
  Calendar,
  Upload,
  CheckCircle,
} from "lucide-react"

interface Appointment {
  id: string
  time: string
  patientName: string
  service: string
  status: string
  amount: string
  address: string
  patient: string
}

interface HealthRecord {
  id: string
  appointmentId: string
  date: string
  time: string
  patientName: string
  serviceType: string
  location: string
  vitals: {
    bloodPressure?: string
    heartRate?: number
    temperature?: number
    bloodSugar?: number
  }
  observations: string
  recommendations: string
  audioRecording?: string
  recordingDuration?: number
  status: "draft" | "completed" | "uploaded"
  createdAt: string
}

interface ServiceRecordManagerProps {
  appointmentId: string
}

export function ServiceRecordManager({ appointmentId }: ServiceRecordManagerProps) {
  const router = useRouter()
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [historyRecords, setHistoryRecords] = useState<HealthRecord[]>([])
  const [currentRecord, setCurrentRecord] = useState<Partial<HealthRecord>>({
    vitals: {},
    observations: "",
    recommendations: "",
    status: "draft",
  })
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [showNewRecordForm, setShowNewRecordForm] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Mock appointment data - 确保与 dashboard.tsx 中的数据匹配
  const mockAppointments = [
    {
      id: "1",
      time: "08:00-09:00",
      patientName: "陈爷爷",
      service: "康复训练",
      status: "已完成",
      amount: "¥320",
      address: "海淀区AA路AA号",
      patient: "陈建国 (78岁，关节炎)",
    },
    {
      id: "2",
      time: "09:00-10:00",
      patientName: "张明",
      service: "基础健康监测",
      status: "待服务",
      amount: "¥280",
      address: "朝阳区XX路XX号",
      patient: "张明 (65岁，高血压)",
    },
    {
      id: "3",
      time: "14:00-15:30",
      patientName: "李华",
      service: "综合健康评估",
      status: "进行中",
      amount: "¥380",
      address: "朝阳区YY路YY号",
      patient: "李华 (62岁，糖尿病)",
    },
    {
      id: "4",
      time: "16:00-17:00",
      patientName: "王奶奶",
      service: "血压测量",
      status: "待服务",
      amount: "¥280",
      address: "西城区BB路BB号",
      patient: "王秀英 (71岁，高血压)",
    },
  ]

  useEffect(() => {
    // 获取预约信息
    const foundAppointment = mockAppointments.find(apt => apt.id === appointmentId)
    if (foundAppointment) {
      setAppointment(foundAppointment)
      // 预填充新记录信息
      setCurrentRecord(prev => ({
        ...prev,
        appointmentId,
        patientName: foundAppointment.patientName,
        serviceType: foundAppointment.service,
        location: foundAppointment.address,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      }))
    }

    // 获取历史记录
    loadHistoryRecords(foundAppointment?.patientName || "")
  }, [appointmentId])

  useEffect(() => {
    if (isRecording && intervalRef.current === null) {
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else if (!isRecording && intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRecording])

  const loadHistoryRecords = (patientName: string) => {
    // 从localStorage获取历史记录
    const stored = localStorage.getItem(`health_records_${patientName}`)
    if (stored) {
      const records = JSON.parse(stored) as HealthRecord[]
      // 按日期倒序排列
      setHistoryRecords(records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data])
        }
      }

      recorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop())
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
      setRecordingTime(0)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('无法开始录音，请检查麦克风权限')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop()
    }
    setIsRecording(false)
  }

  const saveRecord = async () => {
    if (!appointment) return

    // 处理录音文件
    let audioBase64: string | undefined
    if (recordedChunks.length > 0) {
      const audioBlob = new Blob(recordedChunks, { type: 'audio/webm' })
      // 将录音转换为 base64 字符串以保存到 localStorage
      const reader = new FileReader()
      await new Promise((resolve) => {
        reader.onloadend = () => {
          audioBase64 = reader.result as string
          resolve(true)
        }
        reader.readAsDataURL(audioBlob)
      })
    }

    const newRecord: HealthRecord = {
      id: Date.now().toString(),
      appointmentId,
      date: currentRecord.date || new Date().toISOString().split('T')[0],
      time: currentRecord.time || new Date().toLocaleTimeString('zh-CN', { hour12: false }),
      patientName: appointment.patientName,
      serviceType: appointment.service,
      location: appointment.address,
      vitals: currentRecord.vitals || {},
      observations: currentRecord.observations || "",
      recommendations: currentRecord.recommendations || "",
      audioRecording: audioBase64,
      recordingDuration: recordingTime,
      status: "completed",
      createdAt: new Date().toISOString(),
    }

    // 保存到localStorage
    const existingRecords = localStorage.getItem(`health_records_${appointment.patientName}`)
    const records = existingRecords ? JSON.parse(existingRecords) : []
    records.push(newRecord)
    localStorage.setItem(`health_records_${appointment.patientName}`, JSON.stringify(records))

    // 重新加载历史记录
    loadHistoryRecords(appointment.patientName)
    
    // 重置表单
    setCurrentRecord({
      vitals: {},
      observations: "",
      recommendations: "",
      status: "draft",
    })
    setRecordedChunks([])
    setRecordingTime(0)
    setShowNewRecordForm(false)

    alert('记录已保存到本地！')
  }

  const uploadRecord = (recordId: string) => {
    // 模拟上传功能
    const records = localStorage.getItem(`health_records_${appointment?.patientName}`)
    if (records) {
      const recordList = JSON.parse(records)
      const updatedRecords = recordList.map((record: HealthRecord) => 
        record.id === recordId 
          ? { ...record, status: "uploaded" }
          : record
      )
      localStorage.setItem(`health_records_${appointment?.patientName}`, JSON.stringify(updatedRecords))
      loadHistoryRecords(appointment?.patientName || "")
      alert('记录已上传！')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-200"
      case "uploaded":
        return "bg-blue-100 text-blue-700 border-blue-200"
      default:
        return "bg-orange-100 text-orange-700 border-orange-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "已完成"
      case "uploaded":
        return "已上传"
      default:
        return "草稿"
    }
  }

  if (!appointment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-600 mb-4">未找到预约信息</div>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-md mx-auto px-4 py-4">
      {/* 顶部导航 */}
      <div className="flex items-center gap-3 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()} 
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-gray-800">服务记录</h1>
          <p className="text-sm text-gray-600">{appointment.patientName}</p>
        </div>
      </div>

      {/* 当前预约信息 */}
      <Card className="border-0 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg rounded-3xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-3 text-blue-800">
            <Calendar className="h-5 w-5" />
            当前日程
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">{appointment.time}</span>
            </div>
            <Badge className={`${
              appointment.status === "待服务" ? "bg-orange-200 text-orange-700" : "bg-blue-200 text-blue-700"
            }`}>
              {appointment.status}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-700">{appointment.service}</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-700">{appointment.address}</span>
          </div>
        </CardContent>
      </Card>

      {/* 开始记录按钮 */}
      <Card className="border-0 bg-white shadow-lg rounded-3xl">
        <CardContent className="p-6 text-center">
          <Button
            onClick={() => setShowNewRecordForm(true)}
            className="w-full h-16 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-lg font-semibold rounded-3xl shadow-lg"
          >
            <FileText className="h-6 w-6 mr-3" />
            开始记录
          </Button>
        </CardContent>
      </Card>

      {/* 历史记录 */}
      <Card className="border-0 bg-white shadow-lg rounded-3xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-3 text-gray-800">
            <FileText className="h-5 w-5" />
            历史记录
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {historyRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>暂无历史记录</p>
            </div>
          ) : (
            historyRecords.map((record) => (
              <div
                key={record.id}
                className="p-4 border border-gray-100 rounded-2xl hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-800">{record.serviceType}</p>
                    <p className="text-sm text-gray-600">{record.date} {record.time}</p>
                  </div>
                  <Badge className={getStatusColor(record.status)}>
                    {getStatusText(record.status)}
                  </Badge>
                </div>
                
                {record.observations && (
                  <p className="text-sm text-gray-700 mb-2">{record.observations}</p>
                )}
                
                {record.audioRecording && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Mic className="h-4 w-4" />
                    <span>录音时长: {formatTime(record.recordingDuration || 0)}</span>
                  </div>
                )}

                {record.status === "completed" && (
                  <Button
                    size="sm"
                    onClick={() => uploadRecord(record.id)}
                    className="mt-2 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    上传记录
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* 新记录表单模态框 */}
      <Dialog open={showNewRecordForm} onOpenChange={setShowNewRecordForm}>
        <DialogContent className="max-w-sm mx-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-center">创建服务记录</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {/* 录音控制 */}
            <div className="text-center space-y-3">
              <div className="text-sm text-gray-600">
                录音时长: {formatTime(recordingTime)}
              </div>
              <div className="flex justify-center gap-3">
                {!isRecording ? (
                  <Button
                    onClick={startRecording}
                    className="bg-red-500 hover:bg-red-600 text-white rounded-full h-12 w-12"
                  >
                    <Mic className="h-5 w-5" />
                  </Button>
                ) : (
                  <Button
                    onClick={stopRecording}
                    className="bg-gray-500 hover:bg-gray-600 text-white rounded-full h-12 w-12"
                  >
                    <Square className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>

            {/* 生命体征 */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">生命体征</Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-600">血压</Label>
                  <Input
                    placeholder="120/80"
                    value={currentRecord.vitals?.bloodPressure || ""}
                    onChange={(e) => setCurrentRecord(prev => ({
                      ...prev,
                      vitals: { ...prev.vitals, bloodPressure: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">心率</Label>
                  <Input
                    type="number"
                    placeholder="72"
                    value={currentRecord.vitals?.heartRate || ""}
                    onChange={(e) => setCurrentRecord(prev => ({
                      ...prev,
                      vitals: { ...prev.vitals, heartRate: parseInt(e.target.value) || 0 }
                    }))}
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">体温 (°C)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="36.5"
                    value={currentRecord.vitals?.temperature || ""}
                    onChange={(e) => setCurrentRecord(prev => ({
                      ...prev,
                      vitals: { ...prev.vitals, temperature: parseFloat(e.target.value) || 0 }
                    }))}
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">血糖</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="5.6"
                    value={currentRecord.vitals?.bloodSugar || ""}
                    onChange={(e) => setCurrentRecord(prev => ({
                      ...prev,
                      vitals: { ...prev.vitals, bloodSugar: parseFloat(e.target.value) || 0 }
                    }))}
                  />
                </div>
              </div>
            </div>

            {/* 观察记录 */}
            <div>
              <Label className="text-sm font-medium">观察记录</Label>
              <Textarea
                placeholder="记录患者的症状、体征等观察信息..."
                value={currentRecord.observations || ""}
                onChange={(e) => setCurrentRecord(prev => ({
                  ...prev,
                  observations: e.target.value
                }))}
                className="mt-2"
              />
            </div>

            {/* 医疗建议 */}
            <div>
              <Label className="text-sm font-medium">医疗建议</Label>
              <Textarea
                placeholder="记录治疗建议、用药指导等..."
                value={currentRecord.recommendations || ""}
                onChange={(e) => setCurrentRecord(prev => ({
                  ...prev,
                  recommendations: e.target.value
                }))}
                className="mt-2"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowNewRecordForm(false)}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              onClick={saveRecord}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              保存记录
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
