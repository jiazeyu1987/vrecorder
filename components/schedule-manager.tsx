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
  Clock,
  MapPin,
  User,
  CreditCard,
  Phone,
  CheckCircle,
  AlertCircle,
  Play,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  X,
} from "lucide-react"

interface Appointment {
  id: string
  time: string
  duration: string
  patientName: string
  patientAge: number
  condition: string
  address: string
  serviceType: string
  paymentStatus: "pending" | "paid" | "overdue"
  paymentAmount: number
  status: "scheduled" | "in-progress" | "completed" | "cancelled"
  phone: string
  notes?: string
}

const mockAppointments: Appointment[] = [
  {
    id: "1",
    time: "09:00",
    duration: "1小时",
    patientName: "张明",
    patientAge: 65,
    condition: "高血压",
    address: "朝阳区XX路XX号",
    serviceType: "基础健康监测",
    paymentStatus: "pending",
    paymentAmount: 280,
    status: "scheduled",
    phone: "138****1234",
    notes: "患者反映最近血压不稳定",
  },
  {
    id: "2",
    time: "11:00",
    duration: "1.5小时",
    patientName: "李华",
    patientAge: 62,
    condition: "糖尿病",
    address: "朝阳区YY路YY号",
    serviceType: "综合健康评估",
    paymentStatus: "paid",
    paymentAmount: 350,
    status: "in-progress",
    phone: "139****5678",
  },
  {
    id: "3",
    time: "14:00",
    duration: "1小时",
    patientName: "王小明",
    patientAge: 35,
    condition: "健康体检",
    address: "海淀区ZZ路ZZ号",
    serviceType: "常规体检",
    paymentStatus: "overdue",
    paymentAmount: 200,
    status: "scheduled",
    phone: "136****9012",
  },
  {
    id: "4",
    time: "16:00",
    duration: "1小时",
    patientName: "陈秀英",
    patientAge: 78,
    condition: "高血压+糖尿病",
    address: "海淀区康乐小区5号楼201",
    serviceType: "复合疾病管理",
    paymentStatus: "paid",
    paymentAmount: 400,
    status: "completed",
    phone: "137****3456",
  },
]

export function ScheduleManager() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false)
  const isMobile = useIsMobile()
  const [newAppointment, setNewAppointment] = useState({
    time: "",
    duration: "1小时",
    patientName: "",
    patientAge: "",
    condition: "",
    address: "",
    serviceType: "",
    paymentAmount: "",
    phone: "",
    notes: "",
  })

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    })
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700 border-green-200"
      case "pending":
        return "bg-orange-100 text-orange-700 border-orange-200"
      case "overdue":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "已收款"
      case "pending":
        return "待收款"
      case "overdue":
        return "逾期"
      default:
        return "未知"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-200"
      case "in-progress":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "scheduled":
        return "bg-gray-100 text-gray-700 border-gray-200"
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "已完成"
      case "in-progress":
        return "进行中"
      case "scheduled":
        return "待服务"
      case "cancelled":
        return "已取消"
      default:
        return "未知"
    }
  }

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate)
    newDate.setDate(selectedDate.getDate() + (direction === "next" ? 1 : -1))
    setSelectedDate(newDate)
  }

  const handleCreateAppointment = () => {
    console.log("[v0] Creating new appointment:", newAppointment)
    setShowNewAppointmentModal(false)
    setNewAppointment({
      time: "",
      duration: "1小时",
      patientName: "",
      patientAge: "",
      condition: "",
      address: "",
      serviceType: "",
      paymentAmount: "",
      phone: "",
      notes: "",
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setNewAppointment((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (selectedAppointment) {
    return (
      <div className={`space-y-4 ${isMobile ? 'px-4 py-4' : 'px-6 py-6 max-w-2xl mx-auto'}`}>
        <div className="flex items-center gap-3 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSelectedAppointment(null)} 
            className="p-2 rounded-full hover:bg-gray-100"
          >
            ←
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">服务详情</h1>
            <p className="text-sm text-gray-600">{selectedAppointment.patientName}</p>
          </div>
        </div>

        <Card className="shadow-none border-0 bg-white/80 backdrop-blur-sm rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              服务信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">服务时间</span>
              <span className="font-medium">
                {selectedAppointment.time} ({selectedAppointment.duration})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">服务类型</span>
              <span className="font-medium">{selectedAppointment.serviceType}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">服务状态</span>
              <Badge variant="outline" className={getStatusColor(selectedAppointment.status)}>
                {getStatusText(selectedAppointment.status)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              患者信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">姓名</span>
              <span className="font-medium">{selectedAppointment.patientName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">年龄</span>
              <span className="font-medium">{selectedAppointment.patientAge}岁</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">病情</span>
              <span className="font-medium">{selectedAppointment.condition}</span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-sm text-muted-foreground">地址</span>
              <span className="font-medium text-right">{selectedAppointment.address}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">联系电话</span>
              <span className="font-medium">{selectedAppointment.phone}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              付款信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">服务费用</span>
              <span className="font-medium text-lg">¥{selectedAppointment.paymentAmount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">付款状态</span>
              <Badge variant="outline" className={getPaymentStatusColor(selectedAppointment.paymentStatus)}>
                {getPaymentStatusText(selectedAppointment.paymentStatus)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {selectedAppointment.notes && (
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">备注信息</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{selectedAppointment.notes}</p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {selectedAppointment.status === "scheduled" && (
            <Button className="w-full" size="lg">
              <Play className="h-4 w-4 mr-2" />
              开始服务
            </Button>
          )}

          {selectedAppointment.status === "in-progress" && (
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" size="lg">
                <CheckCircle className="h-4 w-4 mr-2" />
                完成服务
              </Button>
              <Button variant="outline" size="lg">
                <AlertCircle className="h-4 w-4 mr-2" />
                标记异常
              </Button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="lg">
              <Phone className="h-4 w-4 mr-2" />
              联系患者
            </Button>
            <Button variant="outline" size="lg">
              <Edit className="h-4 w-4 mr-2" />
              调整时间
            </Button>
          </div>

          {selectedAppointment.paymentStatus !== "paid" && (
            <Button variant="outline" className="w-full bg-transparent" size="lg">
              <CreditCard className="h-4 w-4 mr-2" />
              处理付款
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${isMobile ? 'px-4 py-4' : 'px-6 py-6 max-w-2xl mx-auto'}`}>
      <div className="space-y-4">
        <div className="text-center py-2">
          <h1 className="text-2xl font-semibold text-gray-800">日程管理</h1>
          <p className="text-sm text-gray-600 mt-1">管理每日服务安排</p>
        </div>

        <Card className="shadow-none border-0 bg-white/80 backdrop-blur-sm rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigateDate("prev")} 
                className="p-3 rounded-full hover:bg-gray-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="text-center">
                <p className="font-semibold text-lg text-gray-800">{formatDate(selectedDate)}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigateDate("next")} 
                className="p-3 rounded-full hover:bg-gray-100"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-none border-0 bg-white/80 backdrop-blur-sm rounded-2xl">
        <CardContent className="p-6">
          <div className={`grid grid-cols-4 gap-4 text-center`}>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-600">4</div>
              <div className="text-xs text-blue-700 mt-1">总预约</div>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl p-4">
              <div className="text-2xl font-bold text-indigo-600">1</div>
              <div className="text-xs text-indigo-700 mt-1">进行中</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-600">1</div>
              <div className="text-xs text-green-700 mt-1">已完成</div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-4">
              <div className="text-2xl font-bold text-amber-600">2</div>
              <div className="text-xs text-amber-700 mt-1">待收款</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {mockAppointments.map((appointment) => (
          <Card
            key={appointment.id}
            className="shadow-none border-0 bg-white/80 backdrop-blur-sm rounded-2xl cursor-pointer hover:bg-white/90 transition-all duration-200 hover:scale-[1.02]"
            onClick={() => setSelectedAppointment(appointment)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-medium">{appointment.time}</span>
                  <span className="text-sm text-muted-foreground">({appointment.duration})</span>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className={getStatusColor(appointment.status)}>
                    {getStatusText(appointment.status)}
                  </Badge>
                  <Badge variant="outline" className={getPaymentStatusColor(appointment.paymentStatus)}>
                    ¥{appointment.paymentAmount}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {appointment.patientName}家 - {appointment.serviceType}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {appointment.patientName} ({appointment.patientAge}岁，{appointment.condition}) |{" "}
                    {appointment.address}
                  </span>
                </div>
              </div>

              {appointment.status === "scheduled" && (
                <div className="flex gap-2 mt-3 pt-3 border-t">
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    开始
                  </Button>
                  <Button size="sm" variant="outline">
                    调整
                  </Button>
                  {appointment.paymentStatus !== "paid" && (
                    <Button size="sm" variant="outline" className="text-orange-600 bg-transparent">
                      收款
                    </Button>
                  )}
                </div>
              )}

              {appointment.status === "in-progress" && (
                <div className="flex gap-2 mt-3 pt-3 border-t">
                  <Button size="sm" variant="outline" className="flex-1 text-green-600 bg-transparent">
                    完成
                  </Button>
                  <Button size="sm" variant="outline" className="text-orange-600 bg-transparent">
                    异常
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showNewAppointmentModal} onOpenChange={setShowNewAppointmentModal}>
        <DialogTrigger asChild>
          <Button className="w-full bg-primary/90 hover:bg-primary rounded-2xl py-4 font-medium shadow-lg" variant="default">
            <Plus className="h-5 w-5 mr-2" />
            添加新预约
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              添加新预约
              <Button variant="ghost" size="sm" onClick={() => setShowNewAppointmentModal(false)} className="p-1">
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="time" className="text-sm font-medium">
                  服务时间
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={newAppointment.time}
                  onChange={(e) => handleInputChange("time", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="duration" className="text-sm font-medium">
                  服务时长
                </Label>
                <Select value={newAppointment.duration} onValueChange={(value) => handleInputChange("duration", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5小时">0.5小时</SelectItem>
                    <SelectItem value="1小时">1小时</SelectItem>
                    <SelectItem value="1.5小时">1.5小时</SelectItem>
                    <SelectItem value="2小时">2小时</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="patientName" className="text-sm font-medium">
                  患者姓名
                </Label>
                <Input
                  id="patientName"
                  value={newAppointment.patientName}
                  onChange={(e) => handleInputChange("patientName", e.target.value)}
                  placeholder="请输入患者姓名"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="patientAge" className="text-sm font-medium">
                  患者年龄
                </Label>
                <Input
                  id="patientAge"
                  type="number"
                  value={newAppointment.patientAge}
                  onChange={(e) => handleInputChange("patientAge", e.target.value)}
                  placeholder="年龄"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="condition" className="text-sm font-medium">
                病情描述
              </Label>
              <Input
                id="condition"
                value={newAppointment.condition}
                onChange={(e) => handleInputChange("condition", e.target.value)}
                placeholder="如：高血压、糖尿病等"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="serviceType" className="text-sm font-medium">
                服务类型
              </Label>
              <Select
                value={newAppointment.serviceType}
                onValueChange={(value) => handleInputChange("serviceType", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="请选择服务类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="基础健康监测">基础健康监测</SelectItem>
                  <SelectItem value="综合健康评估">综合健康评估</SelectItem>
                  <SelectItem value="常规体检">常规体检</SelectItem>
                  <SelectItem value="复合疾病管理">复合疾病管理</SelectItem>
                  <SelectItem value="康复护理">康复护理</SelectItem>
                  <SelectItem value="慢病管理">慢病管理</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="address" className="text-sm font-medium">
                服务地址
              </Label>
              <Input
                id="address"
                value={newAppointment.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="请输入详细地址"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="phone" className="text-sm font-medium">
                  联系电话
                </Label>
                <Input
                  id="phone"
                  value={newAppointment.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="患者联系电话"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="paymentAmount" className="text-sm font-medium">
                  服务费用
                </Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  value={newAppointment.paymentAmount}
                  onChange={(e) => handleInputChange("paymentAmount", e.target.value)}
                  placeholder="费用金额"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="text-sm font-medium">
                备注信息
              </Label>
              <Textarea
                id="notes"
                value={newAppointment.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="特殊注意事项或备注"
                className="mt-1 min-h-[60px]"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => setShowNewAppointmentModal(false)}
              >
                取消
              </Button>
              <Button
                className="flex-1"
                onClick={handleCreateAppointment}
                disabled={!newAppointment.time || !newAppointment.patientName || !newAppointment.serviceType}
              >
                创建预约
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
