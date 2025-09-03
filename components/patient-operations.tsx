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
  Calendar,
  Clock,
  CreditCard,
  Phone,
  FileText,
  User,
  MapPin,
  AlertCircle,
  CheckCircle,
  Plus,
  Edit,
  X
} from "lucide-react"

interface Patient {
  id: string
  name: string
  age: number
  phone: string
  address: string
  paymentStatus: "normal" | "overdue" | "suspended"
}

interface Appointment {
  id: string
  patientId: string
  date: string
  time: string
  serviceType: string
  status: "scheduled" | "in-progress" | "completed" | "cancelled"
  location: string
  notes?: string
  duration: string
  fee: number
}

interface Payment {
  id: string
  patientId: string
  date: string
  amount: number
  type: "service" | "package" | "deposit"
  status: "pending" | "paid" | "overdue" | "refunded"
  description: string
  dueDate?: string
}

interface PatientOperationsProps {
  patient: Patient
  onClose: () => void
}

const mockAppointments: Appointment[] = [
  {
    id: "1",
    patientId: "1",
    date: "2024-03-22",
    time: "09:00",
    serviceType: "基础健康监测",
    status: "scheduled",
    location: "朝阳区幸福小区3号楼502",
    duration: "1小时",
    fee: 280,
    notes: "复查血压"
  }
]

const mockPayments: Payment[] = [
  {
    id: "1",
    patientId: "1",
    date: "2024-03-10",
    amount: 280,
    type: "service",
    status: "paid",
    description: "基础健康监测服务费"
  },
  {
    id: "2",
    patientId: "2",
    date: "2024-03-01",
    amount: 350,
    type: "service",
    status: "overdue",
    description: "糖尿病管理服务费",
    dueDate: "2024-03-15"
  }
]

export function PatientOperations({ patient, onClose }: PatientOperationsProps) {
  const [activeOperation, setActiveOperation] = useState<string | null>(null)
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false)
  const [showNewPaymentModal, setShowNewPaymentModal] = useState(false)
  const [showCallModal, setShowCallModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const isMobile = useIsMobile()
  
  const [newAppointment, setNewAppointment] = useState({
    date: "",
    time: "",
    serviceType: "",
    duration: "1小时",
    location: patient.address,
    notes: "",
    fee: 280
  })

  const [newPayment, setNewPayment] = useState<{
    amount: string
    type: "service" | "package" | "deposit"
    description: string
    dueDate: string
  }>({
    amount: "",
    type: "service" as const,
    description: "",
    dueDate: ""
  })

  const patientAppointments = mockAppointments.filter(apt => apt.patientId === patient.id)
  const patientPayments = mockPayments.filter(pay => pay.patientId === patient.id)

  const getAppointmentStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "in-progress":
        return "bg-green-100 text-green-700 border-green-200"
      case "completed":
        return "bg-gray-100 text-gray-700 border-gray-200"
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700 border-green-200"
      case "pending":
        return "bg-orange-100 text-orange-700 border-orange-200"
      case "overdue":
        return "bg-red-100 text-red-700 border-red-200"
      case "refunded":
        return "bg-gray-100 text-gray-700 border-gray-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const handleCreateAppointment = () => {
    console.log("[v0] Creating appointment:", newAppointment)
    setShowNewAppointmentModal(false)
    setNewAppointment({
      date: "",
      time: "",
      serviceType: "",
      duration: "1小时",
      location: patient.address,
      notes: "",
      fee: 280
    })
  }

  const handleCreatePayment = () => {
    console.log("[v0] Creating payment:", newPayment)
    setShowNewPaymentModal(false)
    setNewPayment({
      amount: "",
      type: "service",
      description: "",
      dueDate: ""
    })
  }

  const handleCallPatient = () => {
    console.log("[v0] Calling patient:", patient.phone)
    setShowCallModal(false)
  }

  const handleGenerateReport = () => {
    console.log("[v0] Generating report for patient:", patient.id)
    setShowReportModal(false)
  }

  return (
    <div className={`space-y-4 ${isMobile ? 'px-4 py-4' : 'px-6 py-6'}`}>
      <div className="flex items-center gap-3 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose} 
          className="p-2 rounded-full hover:bg-gray-100"
        >
          ←
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-gray-800">患者操作</h1>
          <p className="text-sm text-gray-600">{patient.name}</p>
        </div>
      </div>

      {/* 操作菜单 */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Button 
          variant="outline" 
          className={`h-20 flex flex-col gap-2 bg-transparent ${activeOperation === 'appointments' ? 'border-primary bg-primary/5' : ''}`}
          onClick={() => setActiveOperation(activeOperation === 'appointments' ? null : 'appointments')}
        >
          <Calendar className="h-5 w-5 text-primary" />
          <span className="text-sm">预约管理</span>
        </Button>
        
        <Button 
          variant="outline" 
          className={`h-20 flex flex-col gap-2 bg-transparent ${activeOperation === 'payments' ? 'border-primary bg-primary/5' : ''}`}
          onClick={() => setActiveOperation(activeOperation === 'payments' ? null : 'payments')}
        >
          <CreditCard className="h-5 w-5 text-green-600" />
          <span className="text-sm">付款管理</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-20 flex flex-col gap-2 bg-transparent"
          onClick={() => setShowCallModal(true)}
        >
          <Phone className="h-5 w-5 text-blue-600" />
          <span className="text-sm">联系患者</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-20 flex flex-col gap-2 bg-transparent"
          onClick={() => setShowReportModal(true)}
        >
          <FileText className="h-5 w-5 text-purple-600" />
          <span className="text-sm">健康报告</span>
        </Button>
      </div>

      {/* 预约管理 */}
      {activeOperation === 'appointments' && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">预约管理</CardTitle>
              <Button 
                size="sm" 
                onClick={() => setShowNewAppointmentModal(true)}
                className="bg-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                新建预约
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {patientAppointments.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>暂无预约记录</p>
              </div>
            ) : (
              patientAppointments.map((appointment) => (
                <div key={appointment.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{appointment.serviceType}</h4>
                      <p className="text-sm text-gray-600">{appointment.date} {appointment.time}</p>
                    </div>
                    <Badge variant="outline" className={getAppointmentStatusColor(appointment.status)}>
                      {appointment.status === "scheduled" ? "已预约" :
                       appointment.status === "in-progress" ? "进行中" :
                       appointment.status === "completed" ? "已完成" : "已取消"}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      {appointment.location}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      {appointment.duration} | ¥{appointment.fee}
                    </p>
                    {appointment.notes && (
                      <p className="mt-2">{appointment.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      编辑
                    </Button>
                    {appointment.status === "scheduled" && (
                      <Button size="sm" variant="outline" className="text-red-600 border-red-300 bg-transparent">
                        取消
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* 付款管理 */}
      {activeOperation === 'payments' && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">付款管理</CardTitle>
              <Button 
                size="sm" 
                onClick={() => setShowNewPaymentModal(true)}
                className="bg-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                添加付款
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {patientPayments.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <CreditCard className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>暂无付款记录</p>
              </div>
            ) : (
              patientPayments.map((payment) => (
                <div key={payment.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">¥{payment.amount}</h4>
                      <p className="text-sm text-gray-600">{payment.description}</p>
                      <p className="text-sm text-gray-500">{payment.date}</p>
                    </div>
                    <Badge variant="outline" className={getPaymentStatusColor(payment.status)}>
                      {payment.status === "paid" ? "已支付" :
                       payment.status === "pending" ? "待支付" :
                       payment.status === "overdue" ? "逾期" : "已退款"}
                    </Badge>
                  </div>
                  {payment.dueDate && payment.status === "overdue" && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle className="h-3 w-3" />
                      <span>逾期日期: {payment.dueDate}</span>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    {payment.status === "overdue" && (
                      <Button size="sm" className="flex-1 bg-red-600 hover:bg-red-700">
                        催缴
                      </Button>
                    )}
                    {payment.status === "pending" && (
                      <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                        标记已付
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="bg-transparent">
                      详情
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* 新建预约对话框 */}
      <Dialog open={showNewAppointmentModal} onOpenChange={setShowNewAppointmentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>新建预约</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="apt-date">预约日期</Label>
                <Input
                  id="apt-date"
                  type="date"
                  value={newAppointment.date}
                  onChange={(e) => setNewAppointment(prev => ({...prev, date: e.target.value}))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apt-time">预约时间</Label>
                <Input
                  id="apt-time"
                  type="time"
                  value={newAppointment.time}
                  onChange={(e) => setNewAppointment(prev => ({...prev, time: e.target.value}))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="service-type">服务类型</Label>
              <Select
                value={newAppointment.serviceType}
                onValueChange={(value) => setNewAppointment(prev => ({...prev, serviceType: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择服务类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="基础健康监测">基础健康监测 - ¥280</SelectItem>
                  <SelectItem value="综合健康评估">综合健康评估 - ¥350</SelectItem>
                  <SelectItem value="常规体检">常规体检 - ¥200</SelectItem>
                  <SelectItem value="复合疾病管理">复合疾病管理 - ¥400</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">服务地点</Label>
              <Textarea
                id="location"
                value={newAppointment.location}
                onChange={(e) => setNewAppointment(prev => ({...prev, location: e.target.value}))}
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">备注</Label>
              <Textarea
                id="notes"
                value={newAppointment.notes}
                onChange={(e) => setNewAppointment(prev => ({...prev, notes: e.target.value}))}
                placeholder="可选备注信息"
                rows={2}
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowNewAppointmentModal(false)}>
                取消
              </Button>
              <Button className="flex-1" onClick={handleCreateAppointment}>
                创建预约
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 添加付款对话框 */}
      <Dialog open={showNewPaymentModal} onOpenChange={setShowNewPaymentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>添加付款记录</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="amount">金额</Label>
                <Input
                  id="amount"
                  type="number"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment(prev => ({...prev, amount: e.target.value}))}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-type">类型</Label>
                <Select
                  value={newPayment.type}
                  onValueChange={(value: "service" | "package" | "deposit") => setNewPayment(prev => ({...prev, type: value}))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="service">服务费</SelectItem>
                    <SelectItem value="package">套餐费</SelectItem>
                    <SelectItem value="deposit">押金</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">描述</Label>
              <Input
                id="description"
                value={newPayment.description}
                onChange={(e) => setNewPayment(prev => ({...prev, description: e.target.value}))}
                placeholder="付款描述"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="due-date">到期日期（可选）</Label>
              <Input
                id="due-date"
                type="date"
                value={newPayment.dueDate}
                onChange={(e) => setNewPayment(prev => ({...prev, dueDate: e.target.value}))}
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowNewPaymentModal(false)}>
                取消
              </Button>
              <Button className="flex-1" onClick={handleCreatePayment}>
                添加记录
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 联系患者对话框 */}
      <Dialog open={showCallModal} onOpenChange={setShowCallModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>联系患者</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center py-4">
              <User className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <h3 className="text-lg font-medium">{patient.name}</h3>
              <p className="text-2xl font-bold text-primary mt-2">{patient.phone}</p>
            </div>
            
            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleCallPatient}>
                <Phone className="h-4 w-4 mr-2" />
                拨打电话
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowCallModal(false)}>
                取消
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 生成报告对话框 */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>生成健康报告</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center py-4">
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <h3 className="text-lg font-medium">为 {patient.name} 生成健康报告</h3>
              <p className="text-sm text-gray-600 mt-2">将基于最近的健康记录生成PDF报告</p>
            </div>
            
            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleGenerateReport}>
                <FileText className="h-4 w-4 mr-2" />
                生成报告
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowReportModal(false)}>
                取消
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
