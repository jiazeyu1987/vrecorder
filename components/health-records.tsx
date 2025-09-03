"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  FileText,
  Plus,
  Calendar,
  Camera,
  Mic,
  MapPin,
  Heart,
  Activity,
  Thermometer,
  Droplets,
  Weight,
  Stethoscope,
  Eye,
  ChevronRight,
  Play,
  Square,
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
}

const mockRecords: HealthRecord[] = [
  {
    id: "1",
    date: "2024-03-15",
    time: "09:30",
    patientName: "张明",
    patientAge: 65,
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
    date: "2024-03-15",
    time: "14:00",
    patientName: "李华",
    patientAge: 62,
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
    status: "draft",
  },
]

export function HealthRecords() {
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [showNewRecordModal, setShowNewRecordModal] = useState(false)
  const [newRecord, setNewRecord] = useState<Partial<HealthRecord>>({
    patientName: "",
    patientAge: 0,
    serviceType: "",
    location: "",
    vitals: {},
    observations: "",
    recommendations: "",
    photos: [],
    audioNotes: [],
    status: "draft",
  })

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
    console.log("[v0] Submitting new record:", newRecord)
    setShowNewRecordModal(false)
    setNewRecord({
      patientName: "",
      patientAge: 0,
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
      <div className="p-4 space-y-4 max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" onClick={() => setSelectedRecord(null)} className="p-2">
            ←
          </Button>
          <div>
            <h1 className="text-xl font-semibold">服务记录</h1>
            <p className="text-sm text-muted-foreground">{selectedRecord.patientName}</p>
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

        {selectedRecord.photos.length > 0 && (
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Camera className="h-4 w-4 text-primary" />
                服务照片 ({selectedRecord.photos.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {selectedRecord.photos.map((photo, index) => (
                  <div key={index} className="p-2 bg-muted rounded border text-center">
                    <Camera className="h-8 w-8 mx-auto text-muted-foreground mb-1" />
                    <p className="text-xs text-muted-foreground">{photo}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedRecord.audioNotes.length > 0 && (
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Mic className="h-4 w-4 text-primary" />
                语音记录 ({selectedRecord.audioNotes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {selectedRecord.audioNotes.map((audio, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-muted rounded border">
                    <Button size="sm" variant="ghost" className="p-1">
                      <Play className="h-3 w-3" />
                    </Button>
                    <span className="text-sm flex-1">{audio}</span>
                    <span className="text-xs text-muted-foreground">2:30</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold">服务记录</h1>
          <p className="text-sm text-muted-foreground">管理患者健康记录</p>
        </div>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-primary">15</div>
                <div className="text-xs text-muted-foreground">本周记录</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-orange-600">2</div>
                <div className="text-xs text-muted-foreground">待完成</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-green-600">13</div>
                <div className="text-xs text-muted-foreground">已完成</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {mockRecords.map((record) => (
          <Card
            key={record.id}
            className="shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedRecord(record)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <div>
                    <span className="font-medium">{record.patientName}</span>
                    <span className="text-sm text-muted-foreground ml-2">({record.patientAge}岁)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getStatusColor(record.status)}>
                    {getStatusText(record.status)}
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span>
                    {record.date} {record.time}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="truncate">
                    {record.serviceType} - {record.location}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-3 pt-3 border-t text-xs text-muted-foreground">
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
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showNewRecordModal} onOpenChange={setShowNewRecordModal}>
        <DialogTrigger asChild>
          <Button className="w-full bg-transparent" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            创建新记录
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>创建新服务记录</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="patientName">患者姓名</Label>
                <Input
                  id="patientName"
                  value={newRecord.patientName}
                  onChange={(e) => setNewRecord((prev) => ({ ...prev, patientName: e.target.value }))}
                  placeholder="请输入患者姓名"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patientAge">患者年龄</Label>
                <Input
                  id="patientAge"
                  type="number"
                  value={newRecord.patientAge}
                  onChange={(e) =>
                    setNewRecord((prev) => ({ ...prev, patientAge: Number.parseInt(e.target.value) || 0 }))
                  }
                  placeholder="年龄"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceType">服务类型</Label>
              <Select
                value={newRecord.serviceType}
                onValueChange={(value) => setNewRecord((prev) => ({ ...prev, serviceType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择服务类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="基础健康监测">基础健康监测</SelectItem>
                  <SelectItem value="综合健康评估">综合健康评估</SelectItem>
                  <SelectItem value="慢病管理">慢病管理</SelectItem>
                  <SelectItem value="康复护理">康复护理</SelectItem>
                  <SelectItem value="健康咨询">健康咨询</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">服务地点</Label>
              <Input
                id="location"
                value={newRecord.location}
                onChange={(e) => setNewRecord((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="请输入服务地点"
              />
            </div>

            <div className="space-y-3">
              <Label>生命体征</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1">
                    <Heart className="h-3 w-3 text-red-500" />
                    血压 (mmHg)
                  </Label>
                  <Input
                    placeholder="如: 120/80"
                    value={newRecord.vitals?.bloodPressure || ""}
                    onChange={(e) => updateVital("bloodPressure", e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1">
                    <Activity className="h-4 w-4 text-blue-500" />
                    心率 (bpm)
                  </Label>
                  <Input
                    type="number"
                    placeholder="如: 72"
                    value={newRecord.vitals?.heartRate || ""}
                    onChange={(e) => updateVital("heartRate", e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1">
                    <Thermometer className="h-4 w-4 text-orange-500" />
                    体温 (°C)
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="如: 36.5"
                    value={newRecord.vitals?.temperature || ""}
                    onChange={(e) => updateVital("temperature", e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1">
                    <Droplets className="h-4 w-4 text-purple-500" />
                    血糖 (mmol/L)
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="如: 5.6"
                    value={newRecord.vitals?.bloodSugar || ""}
                    onChange={(e) => updateVital("bloodSugar", e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1">
                    <Weight className="h-4 w-4 text-green-500" />
                    体重 (kg)
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="如: 65.5"
                    value={newRecord.vitals?.weight || ""}
                    onChange={(e) => updateVital("weight", e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1">
                    <Activity className="h-4 w-4 text-indigo-500" />
                    身高 (cm)
                  </Label>
                  <Input
                    type="number"
                    placeholder="如: 170"
                    value={newRecord.vitals?.height || ""}
                    onChange={(e) => updateVital("height", e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observations">观察记录</Label>
              <Textarea
                id="observations"
                value={newRecord.observations}
                onChange={(e) => setNewRecord((prev) => ({ ...prev, observations: e.target.value }))}
                placeholder="请详细记录患者的健康状况、症状表现等..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recommendations">医疗建议</Label>
              <Textarea
                id="recommendations"
                value={newRecord.recommendations}
                onChange={(e) => setNewRecord((prev) => ({ ...prev, recommendations: e.target.value }))}
                placeholder="请输入医疗建议、用药指导、生活建议等..."
                rows={3}
              />
            </div>

            <div className="space-y-3">
              <Label>多媒体记录</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="bg-transparent">
                  <Camera className="h-4 w-4 mr-2" />
                  拍照记录
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={`bg-transparent ${isRecording ? "text-red-600 border-red-300" : ""}`}
                  onClick={isRecording ? stopRecording : startRecording}
                >
                  {isRecording ? <Square className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                  {isRecording ? "停止录音" : "语音记录"}
                </Button>
              </div>
              {isRecording && (
                <div className="text-center text-sm text-red-600">
                  录音中... {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, "0")}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowNewRecordModal(false)}>
                取消
              </Button>
              <Button className="flex-1" onClick={handleSubmitNewRecord}>
                保存记录
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
