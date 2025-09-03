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
import { useIsMobile } from "@/hooks/use-mobile"
import {
  FileText,
  Edit,
  Save,
  X,
  Activity,
  Heart,
  Thermometer,
  Droplets,
  Weight,
  Eye,
  Camera,
  Mic,
  Play,
  Square,
  Calendar,
  Clock
} from "lucide-react"

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

interface PatientRecordDetailProps {
  record: HealthRecord
  onSave: (record: HealthRecord) => void
  onClose: () => void
}

export function PatientRecordDetail({ record, onSave, onClose }: PatientRecordDetailProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedRecord, setEditedRecord] = useState<HealthRecord>(record)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const isMobile = useIsMobile()

  const handleSave = () => {
    onSave(editedRecord)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedRecord(record)
    setIsEditing(false)
  }

  const updateVital = (key: string, value: string | number) => {
    setEditedRecord(prev => ({
      ...prev,
      vitals: {
        ...prev.vitals,
        [key]: value
      }
    }))
  }

  const startRecording = () => {
    setIsRecording(true)
    setRecordingTime(0)
    // Recording logic here
  }

  const stopRecording = () => {
    setIsRecording(false)
    // Save audio file
    setEditedRecord(prev => ({
      ...prev,
      audioNotes: [...prev.audioNotes, `录音_${new Date().getTime()}.mp3`]
    }))
  }

  const addPhoto = () => {
    // Photo capture logic here
    setEditedRecord(prev => ({
      ...prev,
      photos: [...prev.photos, `照片_${new Date().getTime()}.jpg`]
    }))
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

  return (
    <div className={`space-y-4 ${isMobile ? 'px-4 py-4' : 'px-6 py-6'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-gray-100"
          >
            ←
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">健康记录详情</h1>
            <p className="text-sm text-gray-600">{editedRecord.patientName}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={getStatusColor(editedRecord.status)}>
            {getStatusText(editedRecord.status)}
          </Badge>
          {!isEditing ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsEditing(true)}
              className="bg-transparent"
            >
              <Edit className="h-4 w-4 mr-2" />
              编辑
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCancel}
                className="bg-transparent"
              >
                <X className="h-4 w-4 mr-2" />
                取消
              </Button>
              <Button 
                size="sm" 
                onClick={handleSave}
                className="bg-primary"
              >
                <Save className="h-4 w-4 mr-2" />
                保存
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 基本信息 */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            服务信息
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">服务日期</Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={editedRecord.date}
                  onChange={(e) => setEditedRecord(prev => ({ ...prev, date: e.target.value }))}
                />
              ) : (
                <p className="text-sm text-gray-600">{editedRecord.date}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">服务时间</Label>
              {isEditing ? (
                <Input
                  type="time"
                  value={editedRecord.time}
                  onChange={(e) => setEditedRecord(prev => ({ ...prev, time: e.target.value }))}
                />
              ) : (
                <p className="text-sm text-gray-600">{editedRecord.time}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">服务类型</Label>
            {isEditing ? (
              <Select
                value={editedRecord.serviceType}
                onValueChange={(value) => setEditedRecord(prev => ({ ...prev, serviceType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="基础健康监测">基础健康监测</SelectItem>
                  <SelectItem value="综合健康评估">综合健康评估</SelectItem>
                  <SelectItem value="常规体检">常规体检</SelectItem>
                  <SelectItem value="复合疾病管理">复合疾病管理</SelectItem>
                  <SelectItem value="康复指导">康复指导</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-gray-600">{editedRecord.serviceType}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">服务地点</Label>
            {isEditing ? (
              <Input
                value={editedRecord.location}
                onChange={(e) => setEditedRecord(prev => ({ ...prev, location: e.target.value }))}
                placeholder="请输入服务地点"
              />
            ) : (
              <p className="text-sm text-gray-600">{editedRecord.location}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 生命体征 */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-red-500" />
            生命体征
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Heart className="h-3 w-3 text-red-500" />
                血压 (mmHg)
              </Label>
              {isEditing ? (
                <Input
                  value={editedRecord.vitals.bloodPressure || ""}
                  onChange={(e) => updateVital("bloodPressure", e.target.value)}
                  placeholder="120/80"
                />
              ) : (
                <p className="text-sm text-gray-600">{editedRecord.vitals.bloodPressure || "未测量"}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-3 w-3 text-green-500" />
                心率 (次/分)
              </Label>
              {isEditing ? (
                <Input
                  type="number"
                  value={editedRecord.vitals.heartRate || ""}
                  onChange={(e) => updateVital("heartRate", parseInt(e.target.value) || 0)}
                  placeholder="72"
                />
              ) : (
                <p className="text-sm text-gray-600">{editedRecord.vitals.heartRate || "未测量"}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Thermometer className="h-3 w-3 text-blue-500" />
                体温 (°C)
              </Label>
              {isEditing ? (
                <Input
                  type="number"
                  step="0.1"
                  value={editedRecord.vitals.temperature || ""}
                  onChange={(e) => updateVital("temperature", parseFloat(e.target.value) || 0)}
                  placeholder="36.5"
                />
              ) : (
                <p className="text-sm text-gray-600">{editedRecord.vitals.temperature || "未测量"}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Droplets className="h-3 w-3 text-purple-500" />
                血糖 (mmol/L)
              </Label>
              {isEditing ? (
                <Input
                  type="number"
                  step="0.1"
                  value={editedRecord.vitals.bloodSugar || ""}
                  onChange={(e) => updateVital("bloodSugar", parseFloat(e.target.value) || 0)}
                  placeholder="5.6"
                />
              ) : (
                <p className="text-sm text-gray-600">{editedRecord.vitals.bloodSugar || "未测量"}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Weight className="h-3 w-3 text-orange-500" />
                体重 (kg)
              </Label>
              {isEditing ? (
                <Input
                  type="number"
                  step="0.1"
                  value={editedRecord.vitals.weight || ""}
                  onChange={(e) => updateVital("weight", parseFloat(e.target.value) || 0)}
                  placeholder="65.0"
                />
              ) : (
                <p className="text-sm text-gray-600">{editedRecord.vitals.weight || "未测量"}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Eye className="h-3 w-3 text-indigo-500" />
                身高 (cm)
              </Label>
              {isEditing ? (
                <Input
                  type="number"
                  value={editedRecord.vitals.height || ""}
                  onChange={(e) => updateVital("height", parseInt(e.target.value) || 0)}
                  placeholder="170"
                />
              ) : (
                <p className="text-sm text-gray-600">{editedRecord.vitals.height || "未测量"}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 观察记录 */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">观察记录</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isEditing ? (
            <Textarea
              value={editedRecord.observations}
              onChange={(e) => setEditedRecord(prev => ({ ...prev, observations: e.target.value }))}
              placeholder="请输入观察记录..."
              rows={4}
            />
          ) : (
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {editedRecord.observations || "无观察记录"}
            </p>
          )}
        </CardContent>
      </Card>

      {/* 医疗建议 */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">医疗建议</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isEditing ? (
            <Textarea
              value={editedRecord.recommendations}
              onChange={(e) => setEditedRecord(prev => ({ ...prev, recommendations: e.target.value }))}
              placeholder="请输入医疗建议..."
              rows={4}
            />
          ) : (
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {editedRecord.recommendations || "无医疗建议"}
            </p>
          )}
        </CardContent>
      </Card>

      {/* 多媒体记录 */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">多媒体记录</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 照片记录 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">照片记录</Label>
              {isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addPhoto}
                  className="bg-transparent"
                >
                  <Camera className="h-3 w-3 mr-2" />
                  拍照
                </Button>
              )}
            </div>
            {editedRecord.photos.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {editedRecord.photos.map((photo, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {photo}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">暂无照片</p>
            )}
          </div>

          {/* 音频记录 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">音频记录</Label>
              {isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`bg-transparent ${isRecording ? "text-red-600 border-red-300" : ""}`}
                >
                  {isRecording ? (
                    <>
                      <Square className="h-3 w-3 mr-2" />
                      停止 ({recordingTime}s)
                    </>
                  ) : (
                    <>
                      <Mic className="h-3 w-3 mr-2" />
                      录音
                    </>
                  )}
                </Button>
              )}
            </div>
            {editedRecord.audioNotes.length > 0 ? (
              <div className="space-y-2">
                {editedRecord.audioNotes.map((audio, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <Play className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-600">{audio}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">暂无音频记录</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 下次访问 */}
      {(editedRecord.nextVisit || isEditing) && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              下次访问
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Input
                type="date"
                value={editedRecord.nextVisit || ""}
                onChange={(e) => setEditedRecord(prev => ({ ...prev, nextVisit: e.target.value }))}
              />
            ) : (
              <p className="text-sm text-gray-600">{editedRecord.nextVisit || "未安排"}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
