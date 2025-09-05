"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  cancelAppointment as cancelAppointmentAPI,
  getServiceTypes,
  getFamilies,
  getSystemDefaultPackages,
  ServicePackage 
} from "@/lib/api"
import {
  Clock,
  MapPin,
  User,
  Package,
  Phone,
  CheckCircle,
  AlertCircle,
  Play,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  X,
  FileText,
} from "lucide-react"

// 使用从 API 导入的 Appointment 接口

// 移除模拟数据，使用真实API数据

// 工具函数：获取北京时间的日期字符串 (YYYY-MM-DD)
const getBeijingDateString = (date: Date): string => {
  // 创建一个新的Date对象，避免修改原对象
  const beijingDate = new Date(date.getTime())
  
  // 获取北京时间的年月日 (避免时区转换问题)
  const year = beijingDate.getFullYear()
  const month = String(beijingDate.getMonth() + 1).padStart(2, '0')
  const day = String(beijingDate.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

// 工具函数：获取北京时间的今天
const getBeijingToday = (): Date => {
  return new Date()
}

export function ScheduleManager() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(() => {
    // 获取北京时间的今天
    return getBeijingToday()
  })
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false)
  const [showEditAppointmentModal, setShowEditAppointmentModal] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [families, setFamilies] = useState<any[]>([])
  const [servicePackages, setServicePackages] = useState<ServicePackage[]>([])
  const [loading, setLoading] = useState(true)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [rescheduleAppointment, setRescheduleAppointment] = useState<Appointment | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState("")
  const [rescheduleTime, setRescheduleTime] = useState("")
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false)
  const [cancelAppointment, setCancelAppointment] = useState<Appointment | null>(null)
  const [showStartConfirmModal, setShowStartConfirmModal] = useState(false)
  const [startAppointment, setStartAppointment] = useState<Appointment | null>(null)
  const isMobile = useIsMobile()
  // 获取当前时间，并设置默认时间为一小时后
  const getDefaultDateTime = () => {
    const now = getBeijingToday()
    const defaultTime = new Date(now.getTime() + 60 * 60 * 1000) // 一小时后
    return {
      date: getBeijingDateString(now),
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
    notes: ""
  })
  // 加载数据
  useEffect(() => {
    loadInitialData()
    loadAppointmentsByDate()
  }, [])

  const loadInitialData = async () => {
    try {
      console.log('ScheduleManager: 开始加载初始数据')
      const [serviceTypesResponse, familiesResponse, servicePackagesResponse] = await Promise.all([
        getServiceTypes(),
        getFamilies(1, 100), // 获取前100个家庭
        getSystemDefaultPackages() // 获取服务套餐
      ])
      
      console.log('ScheduleManager: 加载服务类型', serviceTypesResponse.data)
      console.log('ScheduleManager: 加载家庭数据', familiesResponse.data)
      console.log('ScheduleManager: 家庭数据结构', familiesResponse.data.families)
      console.log('ScheduleManager: 加载服务套餐', servicePackagesResponse.data)
      
      setServiceTypes(serviceTypesResponse.data)
      setFamilies(familiesResponse.data.families)
      setServicePackages(servicePackagesResponse.data)
      
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

  const loadAppointmentsByDate = async (dateToUse?: Date) => {
    try {
      setLoading(true)
      
      // 使用传入的日期或当前选择的日期
      const targetDate = dateToUse || selectedDate
      const selectedDateStr = getBeijingDateString(targetDate)
      const todayStr = getBeijingDateString(getBeijingToday())
      
      console.log('📅 ====== 加载预约数据开始 ====== (使用北京时间)')
      console.log('📅 目标日期对象:', targetDate)
      console.log('📅 目标日期字符串 (北京时间):', selectedDateStr)
      console.log('📅 今天日期对象:', getBeijingToday())
      console.log('📅 今天字符串 (北京时间):', todayStr)
      console.log('📅 日期字符串比较 selectedDateStr === todayStr:', selectedDateStr === todayStr)
      
      let response
      // 如果选择的是今天，使用日期范围查询以获取所有状态的预约
      if (selectedDateStr === todayStr) {
        console.log('📅 使用日期范围查询获取今日所有预约（包括所有状态）')
        response = await getAppointments(1, 100, '', selectedDateStr, selectedDateStr)
        console.log('📅 API响应:', response)
        console.log('📅 今日预约数量', response.data.appointments?.length || 0)
        console.log('📅 今日预约详情', response.data.appointments)
        
        // 详细记录每个预约的状态
        if (response.data.appointments && response.data.appointments.length > 0) {
          console.log('📅 每个预约的详细状态:')
          response.data.appointments.forEach((apt, index) => {
            console.log(`📅   [${index}] ID:${apt.id}, 状态:${apt.status}, 患者:${apt.patient?.name}, 时间:${apt.start_time}`)
          })
        }
        
        setAppointments(response.data.appointments || [])
      } else {
        // 如果选择的不是今天，使用日期范围查询
        console.log('📅 使用日期范围查询，日期:', selectedDateStr)
        response = await getAppointments(1, 100, '', selectedDateStr, selectedDateStr)
        console.log('📅 API响应:', response)
        console.log('📅 指定日期预约数量', response.data.appointments?.length || 0)
        setAppointments(response.data.appointments || [])
      }
      
      console.log('📅 ====== 加载预约数据完成 ======')
      
    } catch (error) {
      console.error('❌ ScheduleManager: 加载预约数据失败', error)
      console.error('❌ 错误详情:', error)
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

  // 获取家庭的套餐信息
  const getFamilyPackageInfo = (patientId: number) => {
    console.log('ScheduleManager: 查找患者套餐信息', patientId, families)
    
    // 查找患者所属的家庭
    const family = families.find(fam => 
      fam.members && fam.members.some((member: any) => member.id === patientId)
    )
    
    if (family) {
      console.log('ScheduleManager: 找到家庭', family)
      // 查找户主信息
      const householdHead = family.members.find((member: any) => 
        member.relationship === '户主' || member.relationship === 'householdHead'
      )
      
      if (householdHead) {
        console.log('ScheduleManager: 找到户主', householdHead)
        // 查找对应的服务套餐
        const servicePackage = servicePackages.find(pkg => pkg.name === householdHead.packageType)
        return {
          householdHead: householdHead.name,
          packageName: householdHead.packageType,
          packageDetails: servicePackage
        }
      }
    }
    
    console.log('ScheduleManager: 未找到套餐信息')
    return null
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-200"
      case "confirmed":
        return "bg-orange-100 text-orange-700 border-orange-200"
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
        return "进行中"
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
    console.log('🔄 navigateDate - 开始导航 (使用北京时间)')
    console.log('  - 方向:', direction)
    console.log('  - 当前selectedDate:', selectedDate)
    console.log('  - 当前selectedDate字符串 (北京时间):', getBeijingDateString(selectedDate))
    
    const newDate = new Date(selectedDate)
    newDate.setDate(selectedDate.getDate() + (direction === "next" ? 1 : -1))
    
    console.log('  - 新计算的日期:', newDate)
    console.log('  - 新计算的日期字符串 (北京时间):', getBeijingDateString(newDate))
    
    // 🔥 强制清空预约列表，避免显示缓存数据
    console.log('🔄 navigateDate - 先清空预约列表，避免显示旧数据')
    setAppointments([])
    
    setSelectedDate(newDate)
    
    console.log('🔄 navigateDate - 直接使用新日期调用loadAppointmentsByDate')
    loadAppointmentsByDate(newDate) // 直接传递新日期，不依赖状态更新
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
        notes: newAppointment.notes
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
        notes: ""
      })
      
      // 强制刷新预约列表
      console.log('ScheduleManager: 预约创建成功，强制刷新列表')
      
      // 如果创建的预约不是当前选择的日期，切换到预约的日期
      const appointmentDate = new Date(appointmentData.scheduled_date)
      const currentSelectedDate = selectedDate.toISOString().split('T')[0]
      
      console.log('ScheduleManager: 预约创建日期', appointmentData.scheduled_date)
      console.log('ScheduleManager: 当前选择日期', currentSelectedDate)
      
      if (appointmentData.scheduled_date !== currentSelectedDate) {
        console.log('ScheduleManager: 切换到预约日期')
        setSelectedDate(appointmentDate)
        await loadAppointmentsByDate(appointmentDate)
      } else {
        console.log('ScheduleManager: 在当前日期，重新加载预约数据')
        // 重新加载预约数据
        await loadAppointmentsByDate()
      }
      
      // 备用：尝试加载所有预约来验证预约是否真的创建了
      try {
        console.log('ScheduleManager: 备用验证 - 获取所有预约')
        const allAppointmentsResponse = await getAppointments(1, 100, '', '', '')
        console.log('ScheduleManager: 所有预约', allAppointmentsResponse.data.appointments)
      } catch (error) {
        console.error('ScheduleManager: 获取所有预约失败', error)
      }
      
    } catch (error) {
      console.error('ScheduleManager: 创建预约失败', error)
      toast.error('创建预约失败，请重试')
    }
  }

  // 显示取消预约确认框
  const handleCancelAppointment = (appointment: Appointment | number) => {
    console.log("ScheduleManager: 显示取消预约确认框", appointment)
    
    if (typeof appointment === 'number') {
      // 如果传入的是ID，需要从appointments中找到对应的预约
      const foundAppointment = appointments.find(appt => appt.id === appointment)
      if (foundAppointment) {
        setCancelAppointment(foundAppointment)
        setShowCancelConfirmModal(true)
      }
    } else {
      // 如果传入的是预约对象
      setCancelAppointment(appointment)
      setShowCancelConfirmModal(true)
    }
  }

  // 确认取消预约
  const confirmCancelAppointment = async () => {
    if (!cancelAppointment) return
    
    try {
      console.log("ScheduleManager: 确认取消预约", cancelAppointment.id)
      
      const response = await cancelAppointmentAPI(cancelAppointment.id)
      console.log("ScheduleManager: 取消预约成功", response.data)
      
      toast.success('预约已取消')
      setShowCancelConfirmModal(false)
      setCancelAppointment(null)
      loadAppointmentsByDate()
    } catch (error) {
      console.error('ScheduleManager: 取消预约失败', error)
      toast.error('取消预约失败，请重试')
    }
  }

  // 显示开始服务确认框
  const handleStartService = (appointment: Appointment) => {
    console.log("ScheduleManager: 显示开始服务确认框", appointment)
    setStartAppointment(appointment)
    setShowStartConfirmModal(true)
  }

  // 确认开始服务
  const confirmStartService = async () => {
    if (!startAppointment) return
    
    try {
      console.log("🚀 ScheduleManager: ====== 开始服务流程 ======")
      console.log("🚀 当前预约信息:", startAppointment)
      console.log("🚀 当前预约状态:", startAppointment.status)
      console.log("🚀 当前预约ID:", startAppointment.id)
      
      // 更新预约状态为已确认（进行中）
      console.log("🚀 准备更新预约状态为 confirmed...")
      const updateResult = await handleUpdateAppointment(startAppointment.id, { status: 'confirmed' })
      console.log("🚀 预约状态更新完成, 结果:", updateResult)
      
      // 验证更新是否成功 - 重新获取预约详情
      console.log("🚀 验证更新结果...")
      try {
        const updatedAppointment = await getAppointmentDetail(startAppointment.id)
        console.log("🚀 更新后的预约详情:", updatedAppointment.data)
        console.log("🚀 更新后的预约状态:", updatedAppointment.data.status)
        
        if (updatedAppointment.data.status !== 'confirmed') {
          console.error("❌ 状态更新异常！预期: confirmed, 实际:", updatedAppointment.data.status)
          toast.error(`状态更新异常: ${updatedAppointment.data.status}`)
        } else {
          console.log("✅ 状态更新成功确认")
        }
      } catch (verifyError) {
        console.error("❌ 验证更新结果失败:", verifyError)
      }
      
      // 关闭确认框
      console.log("🚀 关闭确认对话框...")
      setShowStartConfirmModal(false)
      setStartAppointment(null)
      
      // 准备跳转参数
      const params = new URLSearchParams({
        familyId: startAppointment.patient?.family?.id?.toString() || '',
        familyName: startAppointment.patient?.family?.name || startAppointment.patient?.name || '',
        patientName: startAppointment.patient?.name || '',
        service: startAppointment.service_type?.name || '',
        time: startAppointment.start_time,
        address: startAppointment.patient?.family?.address || '',
        appointmentId: startAppointment.id.toString()
      })
      
      console.log("🚀 跳转参数:", params.toString())
      console.log("🚀 准备跳转到记录页面...")
      
      // 立即跳转到记录页面
      console.log("🚀 执行跳转...")
      router.push(`/records?${params.toString()}`)
      
    } catch (error) {
      console.error('❌ ScheduleManager: 开始服务失败', error)
      console.error('❌ 错误详情:', error)
      toast.error('开始服务失败，请重试')
    }
  }

  // 重新安排预约
  const handleRescheduleAppointment = async (appointmentId: number, newDateTime: { date: string, time: string }) => {
    try {
      console.log("ScheduleManager: 重新安排预约", appointmentId, newDateTime)
      
      const response = await updateAppointment(appointmentId, {
        scheduled_date: newDateTime.date,
        scheduled_time: newDateTime.time
      })
      console.log("ScheduleManager: 重新安排预约成功", response.data)
      
      toast.success('预约时间已调整')
      setShowRescheduleModal(false)
      loadAppointmentsByDate()
    } catch (error) {
      console.error('ScheduleManager: 重新安排预约失败', error)
      toast.error('调整预约时间失败，请重试')
    }
  }

  const handleUpdateAppointment = async (appointmentId: number, updates: Partial<CreateAppointmentRequest>) => {
    try {
      console.log("📝 ScheduleManager: ====== 更新预约开始 ======")
      console.log("📝 预约ID:", appointmentId)
      console.log("📝 更新内容:", updates)
      console.log("📝 当前预约列表长度:", appointments.length)
      
      const response = await updateAppointment(appointmentId, updates)
      console.log("📝 API更新响应:", response)
      console.log("📝 更新后的预约数据:", response.data)
      console.log("📝 更新后的预约状态:", response.data.status)
      
      toast.success('预约更新成功')
      
      // 重新加载预约数据
      console.log("📝 重新加载预约数据...")
      await loadAppointmentsByDate()
      console.log("📝 重新加载完成，新的预约列表长度:", appointments.length)
      
      // 如果正在查看详情，更新详情数据
      if (selectedAppointment && selectedAppointment.id === appointmentId) {
        console.log("📝 更新当前选中的预约详情")
        setSelectedAppointment(response.data)
      }
      
      console.log("📝 ====== 更新预约完成 ======")
      return response.data
      
    } catch (error) {
      console.error('❌ ScheduleManager: 更新预约失败', error)
      console.error('❌ 错误详情:', error)
      toast.error('更新预约失败，请重试')
      throw error // 重新抛出错误，让调用方知道失败了
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
      console.log("🏁 ScheduleManager: ====== 完成预约被调用 ======")
      console.log("🏁 调用堆栈:", new Error().stack)
      console.log("🏁 预约ID:", appointmentId)
      
      // 添加确认对话框防止误操作
      const confirmed = window.confirm("确定要完成这个预约吗？完成后将无法撤销。")
      if (!confirmed) {
        console.log("🏁 用户取消完成预约操作")
        return
      }
      
      const response = await completeAppointment(appointmentId)
      console.log("🏁 ScheduleManager: 完成预约API响应", response.data)
      
      toast.success('预约已完成')
      
      // 重新加载预约数据
      console.log("🏁 重新加载预约数据...")
      loadAppointmentsByDate()
      
      // 如果正在查看详情，更新详情数据
      if (selectedAppointment && selectedAppointment.id === appointmentId) {
        console.log("🏁 更新选中的预约详情")
        setSelectedAppointment(response.data)
      }
      
    } catch (error) {
      console.error('❌ ScheduleManager: 完成预约失败', error)
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

          {/* 套餐信息卡片 */}
          <div className="bg-white rounded-xl shadow-sm mx-4 mb-3 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Package className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900">套餐信息</h3>
              </div>
            </div>
            <div className="px-6 py-4 space-y-4">
              {(() => {
                const packageInfo = getFamilyPackageInfo(selectedAppointment.patient_id)
                return packageInfo ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">户主姓名</span>
                      <span className="font-semibold text-gray-900">{packageInfo.householdHead}</span>
                    </div>
                    <div className="w-full h-px bg-gray-100"></div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">服务套餐</span>
                      <span className="font-semibold text-blue-600">{packageInfo.packageName}</span>
                    </div>
                    {packageInfo.packageDetails && (
                      <>
                        <div className="w-full h-px bg-gray-100"></div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm">套餐价格</span>
                          <span className="font-semibold text-green-600">¥{packageInfo.packageDetails.price}/月</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm">服务频率</span>
                          <span className="text-gray-900">{packageInfo.packageDetails.service_frequency}次/月</span>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <span>未找到套餐信息</span>
                  </div>
                )
              })()}
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
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-medium" 
              size="lg"
              onClick={() => handleStartService(selectedAppointment)}
            >
              <Play className="h-5 w-5 mr-2" />
              开始服务
            </Button>
          )}

          {selectedAppointment.status === "confirmed" && (
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
            <Button 
              variant="outline" 
              className="rounded-xl py-3 border-gray-200 text-gray-700 hover:bg-gray-50" 
              size="lg"
              onClick={() => {
                setRescheduleAppointment(selectedAppointment)
                setRescheduleDate(selectedAppointment.scheduled_date)
                setRescheduleTime(selectedAppointment.start_time)
                setShowRescheduleModal(true)
              }}
            >
              <Edit className="h-5 w-5 mr-2" />
              调整时间
            </Button>
          </div>

          {selectedAppointment.status !== "cancelled" && selectedAppointment.status !== "completed" && (
            <Button 
              variant="outline" 
              className="w-full rounded-xl py-3 border-red-200 text-red-700 hover:bg-red-50" 
              size="lg"
              onClick={() => handleCancelAppointment(selectedAppointment.id)}
            >
              <X className="h-5 w-5 mr-2" />
              取消预约
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
                <p className="font-semibold text-lg text-gray-800">
                  {formatDate(selectedDate)}
                </p>
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
          <div className={`grid grid-cols-3 gap-4 text-center`}>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-600">{appointments.length}</div>
              <div className="text-xs text-blue-700 mt-1">总预约</div>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl p-4">
              <div className="text-2xl font-bold text-indigo-600">{appointments.filter(app => app.status === 'scheduled' || app.status === 'confirmed').length}</div>
              <div className="text-xs text-indigo-700 mt-1">进行中</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-600">{appointments.filter(app => app.status === 'completed').length}</div>
              <div className="text-xs text-green-700 mt-1">已完成</div>
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
                  {(() => {
                    const packageInfo = getFamilyPackageInfo(appointment.patient_id)
                    return packageInfo ? (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {packageInfo.packageName}
                      </Badge>
                    ) : null
                  })()}
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
                      handleStartService(appointment)
                    }}
                  >
                    开始
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      setRescheduleAppointment(appointment)
                      setRescheduleDate(appointment.scheduled_date)
                      setRescheduleTime(appointment.start_time)
                      setShowRescheduleModal(true)
                    }}
                  >
                    调整
                  </Button>
                  {appointment.status !== "cancelled" && appointment.status !== "completed" && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600 bg-transparent border-red-200 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCancelAppointment(appointment.id)
                      }}
                    >
                      取消
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
                    
                    // 只显示户主，不显示其他家庭成员
                    const householdHead = members.find(member => 
                      member.relationship === '户主' || member.relationship === 'householdHead'
                    );
                    
                    return householdHead ? (
                      <SelectItem 
                        key={`${family.id}-${householdHead.id || householdHead.name}`} 
                        value={householdHead.id?.toString() || `${family.id}-household`}
                      >
                        {familyName} - {householdHead.name} ({householdHead.age}岁, 户主)
                      </SelectItem>
                    ) : (
                      <SelectItem 
                        key={family.id} 
                        value={family.id?.toString()}
                        disabled
                      >
                        {familyName} - 暂无户主信息
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

      {/* 重新安排预约对话框 */}
      <Dialog open={showRescheduleModal} onOpenChange={setShowRescheduleModal}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-center text-gray-900 mb-4">
              调整预约时间
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 p-4">
            {rescheduleAppointment && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="text-sm text-gray-600 mb-2">当前预约</div>
                <div className="font-medium">{rescheduleAppointment.patient?.name || `患者ID: ${rescheduleAppointment.patient_id}`}</div>
                <div className="text-sm text-gray-600">{rescheduleAppointment.scheduled_date} {rescheduleAppointment.start_time}</div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="reschedule-date">新的日期</Label>
                <Input
                  id="reschedule-date"
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="reschedule-time">新的时间</Label>
                <Input
                  id="reschedule-time"
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => setShowRescheduleModal(false)}
              >
                取消
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  if (rescheduleAppointment && rescheduleDate && rescheduleTime) {
                    handleRescheduleAppointment(rescheduleAppointment.id, {
                      date: rescheduleDate,
                      time: rescheduleTime
                    })
                  }
                }}
                disabled={!rescheduleDate || !rescheduleTime}
              >
                确认调整
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 取消预约确认对话框 */}
      <Dialog open={showCancelConfirmModal} onOpenChange={setShowCancelConfirmModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              确认取消预约
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-2">取消预约信息</h4>
              {cancelAppointment && (
                <div className="space-y-2 text-sm text-red-700">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>患者：{cancelAppointment.patient?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>时间：{cancelAppointment.scheduled_date} {cancelAppointment.start_time}</span>
                  </div>
                  {cancelAppointment.notes && (
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5" />
                      <span>备注：{cancelAppointment.notes}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <p className="text-sm text-gray-600">
              确认要取消这个预约吗？此操作无法撤销。
            </p>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowCancelConfirmModal(false)
                  setCancelAppointment(null)
                }}
              >
                不取消
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={confirmCancelAppointment}
              >
                确认取消
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 开始服务确认对话框 */}
      <Dialog open={showStartConfirmModal} onOpenChange={setShowStartConfirmModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-600">
              <Play className="h-5 w-5" />
              确认开始服务
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">服务信息</h4>
              {startAppointment && (
                <div className="space-y-2 text-sm text-blue-700">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>家庭：{startAppointment.patient?.name}家</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>服务：{startAppointment.service_type?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>时间：{startAppointment.scheduled_date} {startAppointment.start_time}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5" />
                    <span>地址：{startAppointment.patient?.family?.address || '地址未知'}</span>
                  </div>
                </div>
              )}
            </div>
            
            <p className="text-sm text-gray-600">
              确认开始为该家庭提供服务吗？开始后将自动跳转到记录页面。
            </p>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowStartConfirmModal(false)
                  setStartAppointment(null)
                }}
              >
                取消
              </Button>
              <Button
                className="flex-1"
                onClick={confirmStartService}
              >
                确认开始
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ScheduleManager
