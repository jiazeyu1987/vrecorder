"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useIsMobile } from "@/hooks/use-mobile"
import { toast } from "sonner"
import { 
  Appointment, 
  ServiceType, 
  CreateAppointmentRequest,
  getTodayAppointments,
  getAppointments,
  getAppointmentDetail,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  completeAppointment,
  getServiceTypes,
  getFamilies 
} from "@/lib/api"
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

// 使用从 API 导入的 Appointment 接口

// 移除模拟数据，使用真实API数据

export function ScheduleManager() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false)
  const [showEditAppointmentModal, setShowEditAppointmentModal] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [families, setFamilies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const isMobile = useIsMobile()
  // 获取当前时间，并设置默认时间为一小时后
  const getDefaultDateTime = () => {
    const now = new Date()
    const defaultTime = new Date(now.getTime() + 60 * 60 * 1000) // 一小时后
    return {
      date: now.toISOString().split('T')[0],
      time: defaultTime.toTimeString().slice(0, 5) // HH:MM格式
    }
  }

  const [newAppointment, setNewAppointment] = useState({
    patient_id: 0,
    service_type_id: undefined,
    scheduled_date: getDefaultDateTime().date,
    start_time: getDefaultDateTime().time,
    end_time: "",
    duration_minutes: 60, // 默认1小时
    appointment_type: "regular",
    status: "scheduled",
    notes: "",
    payment: {
      amount: 0,
      payment_method: "cash",
      payment_status: "pending",
      notes: ""
    }
  })
  // 加载数据
  useEffect(() => {
    loadInitialData()
  }, [])

  // 当日期改变时，重新加载预约数据
  useEffect(() => {
    if (selectedDate) {
      loadAppointmentsByDate()
    }
  }, [selectedDate])

  const loadInitialData = async () => {
    try {
      console.log('ScheduleManager: 开始加载初始数据')
      const [serviceTypesResponse, familiesResponse] = await Promise.all([
        getServiceTypes(),
        getFamilies(1, 100) // 获取前100个家庭
      ])
      
      console.log('ScheduleManager: 加载服务类型', serviceTypesResponse.data)
      console.log('ScheduleManager: 加载家庭数据', familiesResponse.data)
      console.log('ScheduleManager: 家庭数据结构', familiesResponse.data.families)
      
      setServiceTypes(serviceTypesResponse.data)
      setFamilies(familiesResponse.data.families)
      
      // 设置默认预约日期和时间
      const defaultDateTime = getDefaultDateTime()
      setNewAppointment(prev => ({
        ...prev,
        scheduled_date: defaultDateTime.date,
        start_time: defaultDateTime.time
      }))
      
    } catch (error) {
      console.error('ScheduleManager: 加载初始数据失败', error)
      toast.error('加载数据失败，请刷新页面重试')
    }
  }

  const loadAppointmentsByDate = async () => {
    try {
      setLoading(true)
      console.log('ScheduleManager: 加载指定日期的预约', selectedDate.toISOString().split('T')[0])
      
      const dateStr = selectedDate.toISOString().split('T')[0]
      const response = await getAppointments(1, 100, '', dateStr, dateStr)
      
      console.log('ScheduleManager: 加载预约数据成功', response.data)
      setAppointments(response.data.appointments)
    } catch (error) {
      console.error('ScheduleManager: 加载预约数据失败', error)
      toast.error('加载预约数据失败')
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  const loadTodayAppointments = async () => {
    try {
      setLoading(true)
      console.log('ScheduleManager: 加载今日预约')
      
      const response = await getTodayAppointments()
      console.log('ScheduleManager: 今日预约数据', response.data)
      setAppointments(response.data.appointments || [])
    } catch (error) {
      console.error('ScheduleManager: 加载今日预约失败', error)
      toast.error('加载今日预约失败')
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

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
      case "failed":
      case "refunded":
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
      case "failed":
        return "收款失败"
      case "refunded":
        return "已退款"
      default:
        return "未知"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-200"
      case "confirmed":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "scheduled":
        return "bg-gray-100 text-gray-700 border-gray-200"
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200"
      case "rescheduled":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "已完成"
      case "confirmed":
        return "已确认"
      case "scheduled":
        return "待服务"
      case "cancelled":
        return "已取消"
      case "rescheduled":
        return "已改期"
      default:
        return "未知"
    }
  }

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate)
    newDate.setDate(selectedDate.getDate() + (direction === "next" ? 1 : -1))
    setSelectedDate(newDate)
  }

  // 验证预约时间是否在未来
  const validateAppointmentTime = (date: string, time: string) => {
    const appointmentDateTime = new Date(`${date} ${time}`)
    const now = new Date()
    return appointmentDateTime > now
  }

  const handleCreateAppointment = async () => {
    try {
      console.log("ScheduleManager: 创建新预约", newAppointment)
      
      if (!newAppointment.patient_id || !newAppointment.start_time || !newAppointment.scheduled_date) {
        toast.error('请填写必要的预约信息')
        return
      }
      
      // 验证预约时间不能是过去时间
      if (!validateAppointmentTime(newAppointment.scheduled_date, newAppointment.start_time)) {
        toast.error('预约时间不能是过去时间，请选择未来的时间')
        return
      }
      
      // 准备发送到后端的数据，字段映射
      const appointmentData = {
        patient_id: newAppointment.patient_id,
        scheduled_date: newAppointment.scheduled_date,
        scheduled_time: newAppointment.start_time, // 后端期望的是 scheduled_time
        appointment_type: newAppointment.appointment_type,
        status: newAppointment.status,
        notes: newAppointment.notes,
        payment: newAppointment.payment
      }
      
      const response = await createAppointment(appointmentData)
      console.log("ScheduleManager: 创建预约成功", response.data)
      
      toast.success('预约创建成功')
      setShowNewAppointmentModal(false)
      
      // 重置表单
      const defaultDateTime = getDefaultDateTime()
      setNewAppointment({
        patient_id: 0,
        service_type_id: undefined,
        scheduled_date: defaultDateTime.date,
        start_time: defaultDateTime.time,
        end_time: "",
        duration_minutes: 60,
        appointment_type: "regular",
        status: "scheduled",
        notes: "",
        payment: {
          amount: 0,
          payment_method: "cash",
          payment_status: "pending",
          notes: ""
        }
      })
      
      // 重新加载预约数据
      loadAppointmentsByDate()
      
    } catch (error) {
      console.error('ScheduleManager: 创建预约失败', error)
      toast.error('创建预约失败，请重试')
    }
  }

  const handleUpdateAppointment = async (appointmentId: number, updates: Partial<CreateAppointmentRequest>) => {
    try {
      console.log("ScheduleManager: 更新预约", appointmentId, updates)
      
      const response = await updateAppointment(appointmentId, updates)
      console.log("ScheduleManager: 更新预约成功", response.data)
      
      toast.success('预约更新成功')
      
      // 重新加载预约数据
      loadAppointmentsByDate()
      
      // 如果正在查看详情，更新详情数据
      if (selectedAppointment && selectedAppointment.id === appointmentId) {
        setSelectedAppointment(response.data)
      }
      
    } catch (error) {
      console.error('ScheduleManager: 更新预约失败', error)
      toast.error('更新预约失败，请重试')
    }
  }

  const handleDeleteAppointment = async (appointmentId: number) => {
    try {
      console.log("ScheduleManager: 删除预约", appointmentId)
      
      await deleteAppointment(appointmentId)
      toast.success('预约删除成功')
      
      // 重新加载预约数据
      loadAppointmentsByDate()
      
      // 如果正在查看详情，返回列表
      if (selectedAppointment && selectedAppointment.id === appointmentId) {
        setSelectedAppointment(null)
      }
      
    } catch (error) {
      console.error('ScheduleManager: 删除预约失败', error)
      toast.error('删除预约失败，请重试')
    }
  }

  const handleCompleteAppointment = async (appointmentId: number) => {
    try {
      console.log("ScheduleManager: 完成预约", appointmentId)
      
      const response = await completeAppointment(appointmentId)
      console.log("ScheduleManager: 完成预约成功", response.data)
      
      toast.success('预约已完成')
      
      // 重新加载预约数据
      loadAppointmentsByDate()
      
      // 如果正在查看详情，更新详情数据
      if (selectedAppointment && selectedAppointment.id === appointmentId) {
        setSelectedAppointment(response.data)
      }
      
    } catch (error) {
      console.error('ScheduleManager: 完成预约失败', error)
      toast.error('完成预约失败，请重试')
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setNewAppointment((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (selectedAppointment) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* 微信小程序风格的导航栏 */}
        <div className="sticky top-0 z-50 bg-white border-b border-gray-100">
          <div className="flex items-center justify-between px-4 py-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedAppointment(null)} 
              className="p-2 rounded-lg hover:bg-gray-100 flex items-center gap-2"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="text-sm">返回</span>
            </Button>
            <h1 className="text-lg font-medium text-gray-900">服务详情</h1>
            <div className="w-16"></div> {/* 占位符保持居中 */}
          </div>
        </div>

        <div className={`${isMobile ? 'px-4 pb-6' : 'px-6 pb-8 max-w-4xl mx-auto'}`}>
          {/* 患者头像和基本信息卡片 */}
          <div className="bg-white rounded-xl shadow-sm mx-4 mt-4 mb-3 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8 text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
              <div className="relative">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{selectedAppointment.patient?.name || '未知患者'}</h2>
                    <p className="text-blue-100 text-sm mt-1">{selectedAppointment.patient?.age}岁 · {selectedAppointment.patient?.relationship}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">预约状态</span>
                <Badge variant="outline" className={getStatusColor(selectedAppointment.status)}>
                  {getStatusText(selectedAppointment.status)}
                </Badge>
              </div>
            </div>
          </div>

          {/* 服务信息卡片 */}
          <div className="bg-white rounded-xl shadow-sm mx-4 mb-3 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900">服务信息</h3>
              </div>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="flex items-start justify-between">
                <span className="text-gray-600 text-sm">服务时间</span>
                <span className="font-medium text-right">
                  {selectedAppointment.start_time}{selectedAppointment.end_time ? ` - ${selectedAppointment.end_time}` : ''}<br/>
                  {selectedAppointment.duration_minutes && (
                    <span className="text-xs text-gray-500">预计 {selectedAppointment.duration_minutes}分钟</span>
                  )}
                </span>
              </div>
              <div className="w-full h-px bg-gray-100"></div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">服务类型</span>
                <span className="font-medium">{selectedAppointment.service_type?.name || '未指定服务'}</span>
              </div>
              <div className="w-full h-px bg-gray-100"></div>
              <div className="flex items-start justify-between">
                <span className="text-gray-600 text-sm">服务地址</span>
                <div className="text-right max-w-48">
                  <span className="font-medium text-sm leading-relaxed">{selectedAppointment.patient?.family?.address || '地址未知'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 联系信息卡片 */}
          <div className="bg-white rounded-xl shadow-sm mx-4 mb-3 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                  <Phone className="h-4 w-4 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900">联系方式</h3>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">联系电话</span>
                <a href={`tel:${selectedAppointment.patient?.phone || selectedAppointment.patient?.family?.phone}`} className="font-medium text-blue-600 hover:text-blue-700">
                  {selectedAppointment.patient?.phone || selectedAppointment.patient?.family?.phone || '未知电话'}
                </a>
              </div>
            </div>
          </div>

          {/* 费用信息卡片 */}
          <div className="bg-white rounded-xl shadow-sm mx-4 mb-3 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-orange-600" />
                </div>
                <h3 className="font-medium text-gray-900">费用信息</h3>
              </div>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">服务费用</span>
                <span className="font-semibold text-xl text-gray-900">¥{selectedAppointment.payment?.amount || 0}</span>
              </div>
              <div className="w-full h-px bg-gray-100"></div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">付款状态</span>
                <Badge variant="outline" className={getPaymentStatusColor(selectedAppointment.payment?.payment_status || 'pending')}>
                  {getPaymentStatusText(selectedAppointment.payment?.payment_status || 'pending')}
                </Badge>
              </div>
            </div>
          </div>

          {/* 备注信息卡片 */}
          {selectedAppointment.notes && (
            <div className="bg-white rounded-xl shadow-sm mx-4 mb-6 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                    <AlertCircle className="h-4 w-4 text-purple-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">备注信息</h3>
                </div>
              </div>
              <div className="px-6 py-4">
                <p className="text-sm text-gray-700 leading-relaxed">{selectedAppointment.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* 底部操作栏 */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          {selectedAppointment.status === "scheduled" && (
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-medium" size="lg">
              <Play className="h-5 w-5 mr-2" />
              开始服务
            </Button>
          )}

          {selectedAppointment.status === "in-progress" && (
            <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
              <Button variant="outline" className="rounded-xl py-3 border-green-200 text-green-700 hover:bg-green-50" size="lg">
                <CheckCircle className="h-5 w-5 mr-2" />
                完成服务
              </Button>
              <Button variant="outline" className="rounded-xl py-3 border-orange-200 text-orange-700 hover:bg-orange-50" size="lg">
                <AlertCircle className="h-5 w-5 mr-2" />
                标记异常
              </Button>
            </div>
          )}

          <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
            <Button variant="outline" className="rounded-xl py-3 border-blue-200 text-blue-700 hover:bg-blue-50" size="lg">
              <Phone className="h-5 w-5 mr-2" />
              联系患者
            </Button>
            <Button variant="outline" className="rounded-xl py-3 border-gray-200 text-gray-700 hover:bg-gray-50" size="lg">
              <Edit className="h-5 w-5 mr-2" />
              调整时间
            </Button>
          </div>

          {selectedAppointment.paymentStatus !== "paid" && (
            <Button variant="outline" className="w-full rounded-xl py-3 border-orange-200 text-orange-700 hover:bg-orange-50" size="lg">
              <CreditCard className="h-5 w-5 mr-2" />
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
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">加载中...</div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500">今天没有预约</div>
          </div>
        ) : (
          appointments.map((appointment) => (
          <Card
            key={appointment.id}
            className="shadow-none border-0 bg-white/80 backdrop-blur-sm rounded-2xl cursor-pointer hover:bg-white/90 transition-all duration-200 hover:scale-[1.02]"
            onClick={() => setSelectedAppointment(appointment)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-medium">{appointment.start_time}</span>
                  {appointment.duration_minutes && (
                    <span className="text-sm text-muted-foreground">({appointment.duration_minutes}分钟)</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className={getStatusColor(appointment.status)}>
                    {getStatusText(appointment.status)}
                  </Badge>
                  {appointment.payment && (
                    <Badge variant="outline" className={getPaymentStatusColor(appointment.payment.payment_status)}>
                      ¥{appointment.payment.amount}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {appointment.patient?.name}家 - {appointment.service_type?.name || '未指定服务'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {appointment.patient?.name} ({appointment.patient?.age}岁，{appointment.patient?.relationship}) |{" "}
                    {appointment.patient?.family?.address || '地址未知'}
                  </span>
                </div>
              </div>

              {appointment.status === "scheduled" && (
                <div className="flex gap-2 mt-3 pt-3 border-t">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 bg-transparent"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleUpdateAppointment(appointment.id, { status: 'confirmed' })
                    }}
                  >
                    开始
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      // TODO: 打开编辑对话框
                    }}
                  >
                    调整
                  </Button>
                  {appointment.payment?.payment_status !== "paid" && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-orange-600 bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleUpdateAppointment(appointment.id, { 
                          payment: { 
                            ...appointment.payment, 
                            payment_status: 'paid' 
                          } 
                        })
                      }}
                    >
                      收款
                    </Button>
                  )}
                </div>
              )}

              {appointment.status === "confirmed" && (
                <div className="flex gap-2 mt-3 pt-3 border-t">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 text-green-600 bg-transparent"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCompleteAppointment(appointment.id)
                    }}
                  >
                    完成
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-orange-600 bg-transparent"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleUpdateAppointment(appointment.id, { status: 'cancelled' })
                    }}
                  >
                    取消
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))
        )}
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
            <DialogTitle>
              添加新预约
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* 预约日期 */}
            <div>
              <Label htmlFor="date" className="text-sm font-medium">
                预约日期
              </Label>
              <Input
                id="date"
                type="date"
                value={newAppointment.scheduled_date}
                min={new Date().toISOString().split('T')[0]} // 限制不能选择过去日期
                onChange={(e) => setNewAppointment(prev => ({ ...prev, scheduled_date: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="time" className="text-sm font-medium">
                  预约时间
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={newAppointment.start_time}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, start_time: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="duration" className="text-sm font-medium">
                  预约时长
                </Label>
                <Select value={newAppointment.duration_minutes.toString()} onValueChange={(value) => setNewAppointment(prev => ({ ...prev, duration_minutes: parseInt(value) }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="选择时长" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30分钟</SelectItem>
                    <SelectItem value="60">1小时</SelectItem>
                    <SelectItem value="90">1.5小时</SelectItem>
                    <SelectItem value="120">2小时</SelectItem>
                    <SelectItem value="150">2.5小时</SelectItem>
                    <SelectItem value="180">3小时</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="familyName" className="text-sm font-medium">
                患者家庭
              </Label>
              <Select 
                value={newAppointment.patient_id > 0 ? newAppointment.patient_id.toString() : ""} 
                onValueChange={(value) => {
                  console.log('选择的值:', value);
                  // 如果值包含 "-"，说明是 familyId-memberIndex 格式，需要特殊处理
                  const patientId = value.includes('-') ? 
                    parseInt(value.split('-')[0]) : // 使用家庭ID作为临时patient_id
                    parseInt(value);
                    
                  setNewAppointment(prev => ({ 
                    ...prev, 
                    patient_id: patientId
                  }));
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="选择患者家庭" />
                </SelectTrigger>
                <SelectContent>
                  {families.map((family) => {
                    console.log('渲染家庭:', family);
                    // 兼容不同的数据结构：members 或 patients
                    const members = family.members || family.patients || [];
                    const familyName = family.householdHead || family.name || `家庭${family.id}`;
                    
                    return members.length > 0 ? members.map((member, index) => (
                      <SelectItem 
                        key={`${family.id}-${member.id || member.name || index}`} 
                        value={member.id?.toString() || `${family.id}-${index}`}
                      >
                        {familyName} - {member.name} ({member.age}岁, {member.relationship})
                      </SelectItem>
                    )) : (
                      <SelectItem 
                        key={family.id} 
                        value={family.id?.toString()}
                        disabled
                      >
                        {familyName} - 暂无成员
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
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
                disabled={!newAppointment.start_time || newAppointment.duration_minutes === 0 || newAppointment.patient_id === 0}
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
