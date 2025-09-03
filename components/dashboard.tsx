"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  CreditCard,
  Phone,
  Camera,
  Plus,
  AlertCircle,
  Clock,
  MapPin,
  User,
  DollarSign,
  Activity,
  TrendingUp,
  FileText,
  BarChart3,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export function Dashboard() {
  const [currentDateTime, setCurrentDateTime] = useState(new Date())
  const [showEmergencyModal, setShowEmergencyModal] = useState(false)
  const [showNewServiceModal, setShowNewServiceModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showPhotoUpload, setShowPhotoUpload] = useState(false)
  const [showTaskDetails, setShowTaskDetails] = useState(false)
  const [showWeeklyStats, setShowWeeklyStats] = useState(false)
  const [showFinanceDetails, setShowFinanceDetails] = useState(false)
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false)
  const [showContactDoctor, setShowContactDoctor] = useState(false)
  const [selectedTaskType, setSelectedTaskType] = useState("")
  const [selectedFinanceType, setSelectedFinanceType] = useState("")
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)

  const router = useRouter()

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  const formatDateTime = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekdays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]
    const weekday = weekdays[date.getDay()]

    return `${year}年${month}月${day}日 ${weekday}`
  }

  const handleEmergencyAction = () => {
    setShowEmergencyModal(true)
  }

  const handleNewService = () => {
    setShowNewServiceModal(true)
  }

  const handleScheduleAppointment = () => {
    router.push("/schedule")
  }

  const handleUploadPhoto = () => {
    setShowPhotoUpload(true)
  }

  const handleProcessPayment = () => {
    setShowPaymentModal(true)
  }

  const handleContactDoctor = () => {
    setShowContactDoctor(true)
  }

  const handlePaymentReminder = () => {
    router.push("/payments")
  }

  const handleViewAllSchedule = () => {
    router.push("/schedule")
  }

  const handleAddNewAppointment = () => {
    router.push("/schedule")
  }

  const handleTaskClick = (taskType: string) => {
    setSelectedTaskType(taskType)
    setShowTaskDetails(true)
  }

  const handleWeeklyStatsClick = () => {
    setShowWeeklyStats(true)
  }

  const handleFinanceClick = (financeType: string) => {
    setSelectedFinanceType(financeType)
    setShowFinanceDetails(true)
  }

  const handleAppointmentClick = (appointment: any) => {
    setSelectedAppointment(appointment)
    setShowAppointmentDetails(true)
  }

  const handleTakePhoto = () => {
    setShowPhotoUpload(false)
    alert("正在打开相机...")
  }

  const handleSelectFromGallery = () => {
    setShowPhotoUpload(false)
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.click()
  }

  const handleScanDocument = () => {
    setShowPhotoUpload(false)
    alert("正在打开文档扫描...")
  }

  const handleStartService = (appointment: any) => {
    setShowAppointmentDetails(false)
    router.push(`/records?patient=${appointment.patientName}`)
  }

  const handlePhoneCall = (phoneNumber: string) => {
    try {
      window.location.href = `tel:${phoneNumber}`
      setShowContactDoctor(false)
    } catch (error) {
      alert("无法拨打电话，请手动拨打：" + phoneNumber)
    }
  }

  const handleEmergencyCall = () => {
    try {
      window.location.href = "tel:120"
      setShowContactDoctor(false)
    } catch (error) {
      alert("无法拨打急救电话，请手动拨打：120")
    }
  }

  const todayAppointments = [
    {
      id: 1,
      time: "08:00-09:00",
      patientName: "陈爷爷",
      service: "康复训练",
      status: "已完成",
      amount: "¥320",
      address: "海淀区AA路AA号",
      patient: "陈建国 (78岁，关节炎)",
    },
    {
      id: 2,
      time: "09:00-10:00",
      patientName: "张明",
      service: "基础健康监测",
      status: "待服务",
      amount: "¥280",
      address: "朝阳区XX路XX号",
      patient: "张明 (65岁，高血压)",
    },
    {
      id: 3,
      time: "14:00-15:30",
      patientName: "李华",
      service: "综合健康评估",
      status: "进行中",
      amount: "¥380",
      address: "朝阳区YY路YY号",
      patient: "李华 (62岁，糖尿病)",
    },
    {
      id: 4,
      time: "16:00-17:00",
      patientName: "王奶奶",
      service: "血压测量",
      status: "待服务",
      amount: "¥280",
      address: "西城区BB路BB号",
      patient: "王秀英 (71岁，高血压)",
    },
  ]

  const taskStats = {
    pending: todayAppointments.filter((apt) => apt.status === "待服务").length,
    inProgress: todayAppointments.filter((apt) => apt.status === "进行中").length,
    completed: todayAppointments.filter((apt) => apt.status === "已完成").length,
  }

  return (
    <div className="space-y-4 max-w-md mx-auto">
      {/* 顶部状态栏 */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 mx-4 mt-4 rounded-3xl shadow-lg shadow-green-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">张护士</h1>
              <p className="text-green-100 text-sm flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDateTime(currentDateTime)}
              </p>
            </div>
          </div>
          <div className="bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">工作中</span>
            </div>
          </div>
        </div>
      </div>

      {/* 紧急提醒卡片 */}
      <div className="mx-4">
        <Card className="border-0 bg-gradient-to-r from-red-50 to-orange-50 shadow-lg shadow-red-100/50 rounded-3xl overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-200">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-red-700">紧急提醒</h3>
                  <span className="text-xs text-red-500 bg-red-100 px-2 py-1 rounded-full">15分钟前</span>
                </div>
                <p className="text-sm text-red-600 leading-relaxed">李奶奶血压异常 (180/110 mmHg)，需要立即处理</p>
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 rounded-2xl px-4 py-2 h-8 shadow-lg shadow-red-200 transform hover:scale-105 transition-all duration-200" 
                  onClick={handleEmergencyAction}
                >
                  立即处理
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 今日概览卡片 */}
      <div className="mx-4">
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl shadow-gray-200/50 rounded-3xl overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-3 text-gray-800">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              今日概览
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-3 gap-3">
              <div
                className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl border border-orange-200/50 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 shadow-md shadow-orange-100/50"
                onClick={() => handleTaskClick("pending")}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <div className="text-2xl font-bold text-orange-700 mb-1">{taskStats.pending}</div>
                <div className="text-xs text-orange-600 font-medium">待服务</div>
              </div>
              <div
                className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl border border-blue-200/50 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 shadow-md shadow-blue-100/50"
                onClick={() => handleTaskClick("inProgress")}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <Activity className="h-4 w-4 text-white" />
                </div>
                <div className="text-2xl font-bold text-blue-700 mb-1">{taskStats.inProgress}</div>
                <div className="text-xs text-blue-600 font-medium">进行中</div>
              </div>
              <div
                className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-3xl border border-green-200/50 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 shadow-md shadow-green-100/50"
                onClick={() => handleTaskClick("completed")}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <Activity className="h-4 w-4 text-white" />
                </div>
                <div className="text-2xl font-bold text-green-700 mb-1">{taskStats.completed}</div>
                <div className="text-xs text-green-600 font-medium">已完成</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 本周统计卡片 */}
      <div className="mx-4">
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl shadow-gray-200/50 rounded-3xl overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle
              className="text-lg flex items-center gap-3 text-gray-800 cursor-pointer hover:text-green-600 transition-colors"
              onClick={handleWeeklyStatsClick}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              本周统计
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
                <div className="text-xl font-bold text-blue-700 mb-1">15</div>
                <div className="text-xs text-blue-600">总服务</div>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
                <div className="text-xl font-bold text-green-700 mb-1">2</div>
                <div className="text-xs text-green-600">新患者</div>
              </div>
              <div className="p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl">
                <div className="text-xl font-bold text-yellow-700 mb-1">8</div>
                <div className="text-xs text-yellow-600">复购率</div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-700">财务状况</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div
                  className="p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200/50 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200"
                  onClick={() => handleFinanceClick("pending")}
                >
                  <div className="text-lg font-bold text-orange-700 mb-1">2</div>
                  <div className="text-xs text-orange-600 mb-1">待收款</div>
                  <div className="text-xs text-orange-700 font-semibold">¥560</div>
                </div>
                <div
                  className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200/50 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200"
                  onClick={() => handleFinanceClick("paid")}
                >
                  <div className="text-lg font-bold text-green-700 mb-1">12</div>
                  <div className="text-xs text-green-600 mb-1">已收款</div>
                  <div className="text-xs text-green-700 font-semibold">¥3,240</div>
                </div>
                <div
                  className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200/50 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200"
                  onClick={() => handleFinanceClick("refund")}
                >
                  <div className="text-lg font-bold text-gray-700 mb-1">0</div>
                  <div className="text-xs text-gray-600 mb-1">退款</div>
                  <div className="text-xs text-gray-700 font-semibold">¥0</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 快捷操作卡片 */}
      <div className="mx-4">
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl shadow-gray-200/50 rounded-3xl overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-gray-800 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-2xl flex items-center justify-center">
                <Plus className="h-4 w-4 text-white" />
              </div>
              快捷操作
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Button
                className="h-16 flex-col gap-2 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 border-0 rounded-3xl shadow-lg shadow-blue-100/50 hover:shadow-xl hover:scale-105 transition-all duration-200"
                variant="outline"
                onClick={handleNewService}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center">
                  <Plus className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-semibold">开始新服务</span>
              </Button>
              <Button
                className="h-16 flex-col gap-2 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-700 border-0 rounded-3xl shadow-lg shadow-green-100/50 hover:shadow-xl hover:scale-105 transition-all duration-200"
                variant="outline"
                onClick={handleScheduleAppointment}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-semibold">安排预约</span>
              </Button>
              <Button
                className="h-16 flex-col gap-2 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-purple-700 border-0 rounded-3xl shadow-lg shadow-purple-100/50 hover:shadow-xl hover:scale-105 transition-all duration-200"
                variant="outline"
                onClick={handleUploadPhoto}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl flex items-center justify-center">
                  <Camera className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-semibold">上传照片</span>
              </Button>
              <Button
                className="h-16 flex-col gap-2 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 text-orange-700 border-0 rounded-3xl shadow-lg shadow-orange-100/50 hover:shadow-xl hover:scale-105 transition-all duration-200"
                variant="outline"
                onClick={handleProcessPayment}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-semibold">处理付款</span>
              </Button>
            </div>

            <Button
              className="w-full h-14 flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 text-indigo-700 border-0 rounded-3xl shadow-lg shadow-indigo-100/50 hover:shadow-xl hover:scale-105 transition-all duration-200"
              variant="outline"
              onClick={handleContactDoctor}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-2xl flex items-center justify-center">
                <Phone className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-semibold">联系医生</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 付款提醒卡片 */}
      <div className="mx-4">
        <Card className="border-0 bg-gradient-to-r from-amber-50 to-orange-50 shadow-xl shadow-amber-200/50 rounded-3xl overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-amber-800">付款提醒</h3>
                  <span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full">待处理</span>
                </div>
                <p className="text-sm text-amber-700 leading-relaxed">有2笔待处理的付款事项，总金额 ¥560</p>
                <div className="flex gap-4 text-xs text-amber-600">
                  <span className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                    张先生家 ¥280
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                    王奶奶家 ¥280
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 rounded-2xl px-4 py-2 h-8 shadow-lg shadow-amber-200 transform hover:scale-105 transition-all duration-200"
                onClick={handlePaymentReminder}
              >
                立即处理
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 今日日程卡片 */}
      <div className="mx-4 mb-6">
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl shadow-gray-200/50 rounded-3xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg flex items-center gap-3 text-gray-800">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-500 rounded-2xl flex items-center justify-center">
                <Clock className="h-4 w-4 text-white" />
              </div>
              今日日程
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-2xl px-3 py-1.5" 
              onClick={handleViewAllSchedule}
            >
              查看全部
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className={`p-4 rounded-3xl border cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 ${
                  appointment.status === "已完成"
                    ? "bg-gradient-to-r from-green-50 to-green-100 border-green-200/50 shadow-md shadow-green-100/50"
                    : appointment.status === "进行中"
                      ? "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200/50 shadow-md shadow-blue-100/50"
                      : "bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200/50 shadow-md shadow-orange-100/50"
                }`}
                onClick={() => handleAppointmentClick(appointment)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-2xl flex items-center justify-center ${
                      appointment.status === "已完成"
                        ? "bg-gradient-to-br from-green-400 to-green-500"
                        : appointment.status === "进行中"
                          ? "bg-gradient-to-br from-blue-400 to-blue-500"
                          : "bg-gradient-to-br from-orange-400 to-orange-500"
                    }`}>
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    <span className={`text-sm font-semibold ${
                      appointment.status === "已完成"
                        ? "text-green-800"
                        : appointment.status === "进行中"
                          ? "text-blue-800"
                          : "text-orange-800"
                    }`}>
                      {appointment.time}
                    </span>
                  </div>
                  <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                    appointment.status === "已完成"
                      ? "bg-green-200/50 text-green-700 border border-green-300/50"
                      : appointment.status === "进行中"
                        ? "bg-blue-200/50 text-blue-700 border border-blue-300/50"
                        : "bg-orange-200/50 text-orange-700 border border-orange-300/50"
                  }`}>
                    {appointment.status}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-gray-100 rounded-xl flex items-center justify-center">
                      <MapPin className="h-3 w-3 text-gray-500" />
                    </div>
                    <span className="text-sm text-gray-800 font-medium">
                      {appointment.patientName}家 - {appointment.service}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-gray-100 rounded-xl flex items-center justify-center">
                      <User className="h-3 w-3 text-gray-500" />
                    </div>
                    <span className="text-xs text-gray-600">
                      {appointment.patient} | {appointment.address}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              className="w-full mt-4 h-12 text-teal-600 border-teal-200 bg-gradient-to-r from-teal-50 to-teal-100 hover:from-teal-100 hover:to-teal-200 rounded-3xl border-0 shadow-md shadow-teal-100/50 hover:shadow-lg hover:scale-105 transition-all duration-200"
              onClick={handleAddNewAppointment}
            >
              <Plus className="h-4 w-4 mr-2" />
              添加新预约
            </Button>
          </CardContent>
        </Card>
      </div>

      {showEmergencyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4 text-destructive">紧急处理</h3>
            <p className="text-sm text-muted-foreground mb-4">李奶奶血压异常，建议立即采取以下措施：</p>
            <div className="space-y-2 mb-4">
              <p className="text-sm">• 让患者平躺休息</p>
              <p className="text-sm">• 立即联系主治医生</p>
              <p className="text-sm">• 准备紧急药物</p>
            </div>
            <div className="flex gap-2">
              <Button variant="destructive" className="flex-1" onClick={() => (window.location.href = "tel:120")}>
                拨打120
              </Button>
              <Button variant="outline" onClick={() => setShowEmergencyModal(false)}>
                关闭
              </Button>
            </div>
          </div>
        </div>
      )}

      {showNewServiceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">开始新服务</h3>
            <div className="space-y-3">
              <Button className="w-full justify-start" onClick={() => router.push("/patients")}>
                选择患者
              </Button>
              <Button className="w-full justify-start" onClick={() => router.push("/records")}>
                记录健康数据
              </Button>
              <Button className="w-full justify-start" onClick={() => router.push("/schedule")}>
                查看今日安排
              </Button>
            </div>
            <Button
              variant="outline"
              className="w-full mt-4 bg-transparent"
              onClick={() => setShowNewServiceModal(false)}
            >
              取消
            </Button>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">处理付款</h3>
            <p className="text-sm text-muted-foreground mb-4">选择付款方式：</p>
            <div className="space-y-2">
              <Button className="w-full justify-start bg-green-50 text-green-700 border-green-200" variant="outline">
                微信支付
              </Button>
              <Button className="w-full justify-start bg-blue-50 text-blue-700 border-blue-200" variant="outline">
                支付宝
              </Button>
              <Button className="w-full justify-start bg-transparent" variant="outline">
                现金支付
              </Button>
            </div>
            <Button variant="outline" className="w-full mt-4 bg-transparent" onClick={() => setShowPaymentModal(false)}>
              取消
            </Button>
          </div>
        </div>
      )}

      {showPhotoUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">上传照片</h3>
            <div className="space-y-3">
              <Button className="w-full justify-start bg-transparent" variant="outline" onClick={handleTakePhoto}>
                <Camera className="h-4 w-4 mr-2" />
                拍摄新照片
              </Button>
              <Button
                className="w-full justify-start bg-transparent"
                variant="outline"
                onClick={handleSelectFromGallery}
              >
                <FileText className="h-4 w-4 mr-2" />
                从相册选择
              </Button>
              <Button className="w-full justify-start bg-transparent" variant="outline" onClick={handleScanDocument}>
                <BarChart3 className="h-4 w-4 mr-2" />
                扫描文档
              </Button>
            </div>
            <Button variant="outline" className="w-full mt-4 bg-transparent" onClick={() => setShowPhotoUpload(false)}>
              取消
            </Button>
          </div>
        </div>
      )}

      {showTaskDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">
              {selectedTaskType === "pending" && "待服务任务"}
              {selectedTaskType === "inProgress" && "进行中任务"}
              {selectedTaskType === "completed" && "已完成任务"}
            </h3>
            <div className="space-y-3">
              {todayAppointments
                .filter((apt) => {
                  if (selectedTaskType === "pending") return apt.status === "待服务"
                  if (selectedTaskType === "inProgress") return apt.status === "进行中"
                  if (selectedTaskType === "completed") return apt.status === "已完成"
                  return false
                })
                .map((appointment) => (
                  <div
                    key={appointment.id}
                    className={`p-3 border rounded-lg ${
                      appointment.status === "已完成"
                        ? "bg-green-50"
                        : appointment.status === "进行中"
                          ? "bg-blue-50"
                          : ""
                    }`}
                  >
                    <p className="font-medium">
                      {appointment.patientName}家 - {appointment.service}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.time}
                      {appointment.status === "进行中" && " (进行中)"}
                      {appointment.status === "已完成" && " (已完成)"}
                    </p>
                  </div>
                ))}
            </div>
            <Button variant="outline" className="w-full mt-4 bg-transparent" onClick={() => setShowTaskDetails(false)}>
              关闭
            </Button>
          </div>
        </div>
      )}

      {showWeeklyStats && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">本周详细统计</h3>
            <div className="space-y-4">
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">服务统计</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>总服务次数: 15</div>
                  <div>平均每日: 3次</div>
                  <div>新患者: 2人</div>
                  <div>复购率: 80%</div>
                </div>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">收入统计</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>总收入: ¥3,800</div>
                  <div>待收款: ¥560</div>
                  <div>平均单价: ¥253</div>
                  <div>收款率: 87%</div>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4 bg-transparent" onClick={() => setShowWeeklyStats(false)}>
              关闭
            </Button>
          </div>
        </div>
      )}

      {showFinanceDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">
              {selectedFinanceType === "pending" && "待收款详情"}
              {selectedFinanceType === "paid" && "已收款详情"}
              {selectedFinanceType === "refund" && "退款详情"}
            </h3>
            <div className="space-y-3">
              {selectedFinanceType === "pending" && (
                <>
                  <div className="p-3 border rounded-lg bg-orange-50">
                    <p className="font-medium">张先生家</p>
                    <p className="text-sm text-muted-foreground">基础健康监测 - ¥280</p>
                    <p className="text-xs text-orange-600">逾期3天</p>
                  </div>
                  <div className="p-3 border rounded-lg bg-orange-50">
                    <p className="font-medium">王奶奶家</p>
                    <p className="text-sm text-muted-foreground">血压测量 - ¥280</p>
                    <p className="text-xs text-orange-600">今日到期</p>
                  </div>
                </>
              )}
              {selectedFinanceType === "paid" && (
                <div className="max-h-40 overflow-y-auto space-y-2">
                  <div className="p-2 border rounded bg-green-50 text-sm">
                    <p>李奶奶家 - ¥380 (今日)</p>
                  </div>
                  <div className="p-2 border rounded bg-green-50 text-sm">
                    <p>陈爷爷家 - ¥320 (昨日)</p>
                  </div>
                  <div className="p-2 border rounded bg-green-50 text-sm">
                    <p>刘阿姨家 - ¥280 (昨日)</p>
                  </div>
                </div>
              )}
              {selectedFinanceType === "refund" && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>本周暂无退款记录</p>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              {selectedFinanceType === "pending" && (
                <Button className="flex-1" onClick={() => router.push("/payments")}>
                  处理付款
                </Button>
              )}
              <Button variant="outline" onClick={() => setShowFinanceDetails(false)}>
                关闭
              </Button>
            </div>
          </div>
        </div>
      )}

      {showAppointmentDetails && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">预约详情</h3>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <p className="font-medium">{selectedAppointment.patientName}</p>
                <p className="text-sm text-muted-foreground">{selectedAppointment.service}</p>
                <p className="text-sm text-muted-foreground">{selectedAppointment.time}</p>
                <p className="text-sm text-muted-foreground">{selectedAppointment.address}</p>
                <Badge className="mt-2">{selectedAppointment.status}</Badge>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button className="flex-1" onClick={() => handleStartService(selectedAppointment)}>
                开始服务
              </Button>
              <Button variant="outline" onClick={() => router.push("/schedule")}>
                查看日程
              </Button>
              <Button variant="outline" onClick={() => setShowAppointmentDetails(false)}>
                关闭
              </Button>
            </div>
          </div>
        </div>
      )}

      {showContactDoctor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              联系医生
            </h3>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg bg-blue-50">
                <p className="font-medium text-blue-800">主治医生 - 李医生</p>
                <p className="text-sm text-blue-600">心血管专科</p>
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => handlePhoneCall("400-123-4567")}
                  >
                    <Phone className="h-3 w-3 mr-1" />
                    拨打电话
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-blue-200 text-blue-600 bg-transparent"
                    onClick={() => {
                      setShowContactDoctor(false)
                      alert("消息功能开发中...")
                    }}
                  >
                    发送消息
                  </Button>
                </div>
              </div>

              <div className="p-3 border rounded-lg bg-green-50">
                <p className="font-medium text-green-800">值班医生 - 王医生</p>
                <p className="text-sm text-green-600">全科医生</p>
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handlePhoneCall("400-123-4568")}
                  >
                    <Phone className="h-3 w-3 mr-1" />
                    拨打电话
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-200 text-green-600 bg-transparent"
                    onClick={() => {
                      setShowContactDoctor(false)
                      alert("视频通话功能开发中...")
                    }}
                  >
                    视频通话
                  </Button>
                </div>
              </div>

              <div className="p-3 border rounded-lg bg-red-50">
                <p className="font-medium text-red-800">紧急联系</p>
                <p className="text-sm text-red-600">急救中心 24小时服务</p>
                <Button size="sm" variant="destructive" className="mt-2 w-full" onClick={handleEmergencyCall}>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  拨打 120 急救
                </Button>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full mt-4 bg-transparent"
              onClick={() => setShowContactDoctor(false)}
            >
              取消
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
