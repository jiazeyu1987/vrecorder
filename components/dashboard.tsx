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
  const [selectedAppointment, setSelectedAppointment] = useState(null)

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
    <div className="p-4 space-y-4 max-w-md mx-auto">
      <div className="flex items-center justify-between bg-gradient-to-r from-primary/5 to-accent/5 p-4 rounded-lg">
        <div>
          <h1 className="text-xl font-semibold text-foreground">张护士</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDateTime(currentDateTime)}
          </p>
        </div>
        <Badge variant="secondary" className="bg-accent text-accent-foreground px-3 py-1">
          <Activity className="h-3 w-3 mr-1" />
          工作中
        </Badge>
      </div>

      <Card className="border-destructive/50 bg-destructive/5 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="bg-destructive/10 p-2 rounded-full">
              <AlertCircle className="h-4 w-4 text-destructive" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-destructive">紧急提醒</p>
              <p className="text-xs text-destructive/80 leading-relaxed">李奶奶血压异常 (180/110 mmHg)，需要立即处理</p>
              <p className="text-xs text-muted-foreground">15分钟前</p>
            </div>
            <Button size="sm" variant="destructive" className="shrink-0" onClick={handleEmergencyAction}>
              立即处理
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            今日概览
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div
              className="text-center p-3 bg-orange-50 rounded-lg border border-orange-100 cursor-pointer hover:bg-orange-100 transition-colors"
              onClick={() => handleTaskClick("pending")}
            >
              <div className="text-2xl font-bold text-orange-600">{taskStats.pending}</div>
              <div className="text-xs text-orange-700 font-medium">待服务</div>
            </div>
            <div
              className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors"
              onClick={() => handleTaskClick("inProgress")}
            >
              <div className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</div>
              <div className="text-xs text-blue-700 font-medium">进行中</div>
            </div>
            <div
              className="text-center p-3 bg-green-50 rounded-lg border border-green-100 cursor-pointer hover:bg-green-100 transition-colors"
              onClick={() => handleTaskClick("completed")}
            >
              <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
              <div className="text-xs text-green-700 font-medium">已完成</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle
            className="text-base flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
            onClick={handleWeeklyStatsClick}
          >
            <TrendingUp className="h-4 w-4 text-primary" />
            本周统计
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-2">
              <div className="text-lg font-semibold text-primary">15</div>
              <div className="text-xs text-muted-foreground">总服务</div>
            </div>
            <div className="p-2">
              <div className="text-lg font-semibold text-accent">2</div>
              <div className="text-xs text-muted-foreground">新患者</div>
            </div>
            <div className="p-2">
              <div className="text-lg font-semibold text-secondary">8</div>
              <div className="text-xs text-muted-foreground">复购率</div>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">财务状况</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div
                className="p-2 bg-orange-50 rounded border border-orange-100 cursor-pointer hover:bg-orange-100 transition-colors"
                onClick={() => handleFinanceClick("pending")}
              >
                <div className="text-lg font-semibold text-orange-600">2</div>
                <div className="text-xs text-orange-700">待收款</div>
                <div className="text-xs text-orange-600 font-medium">¥560</div>
              </div>
              <div
                className="p-2 bg-green-50 rounded border border-green-100 cursor-pointer hover:bg-green-100 transition-colors"
                onClick={() => handleFinanceClick("paid")}
              >
                <div className="text-lg font-semibold text-green-600">12</div>
                <div className="text-xs text-green-700">已收款</div>
                <div className="text-xs text-green-600 font-medium">¥3,240</div>
              </div>
              <div
                className="p-2 bg-gray-50 rounded border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleFinanceClick("refund")}
              >
                <div className="text-lg font-semibold text-gray-600">0</div>
                <div className="text-xs text-gray-700">退款</div>
                <div className="text-xs text-gray-600 font-medium">¥0</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">快捷操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Button
              className="h-14 flex-col gap-2 bg-primary/5 hover:bg-primary/10 text-primary border-primary/20"
              variant="outline"
              onClick={handleNewService}
            >
              <Plus className="h-5 w-5" />
              <span className="text-xs font-medium">开始新服务</span>
            </Button>
            <Button
              className="h-14 flex-col gap-2 bg-accent/5 hover:bg-accent/10 text-accent border-accent/20"
              variant="outline"
              onClick={handleScheduleAppointment}
            >
              <Calendar className="h-5 w-5" />
              <span className="text-xs font-medium">安排预约</span>
            </Button>
            <Button
              className="h-14 flex-col gap-2 bg-secondary/5 hover:bg-secondary/10 text-secondary border-secondary/20"
              variant="outline"
              onClick={handleUploadPhoto}
            >
              <Camera className="h-5 w-5" />
              <span className="text-xs font-medium">上传照片</span>
            </Button>
            <Button
              className="h-14 flex-col gap-2 bg-orange-50 hover:bg-orange-100 text-orange-600 border-orange-200"
              variant="outline"
              onClick={handleProcessPayment}
            >
              <CreditCard className="h-5 w-5" />
              <span className="text-xs font-medium">处理付款</span>
            </Button>
          </div>

          <Button
            className="w-full h-12 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
            variant="outline"
            onClick={handleContactDoctor}
          >
            <Phone className="h-4 w-4" />
            <span className="text-sm font-medium">联系医生</span>
          </Button>
        </CardContent>
      </Card>

      <Card className="border-orange-200 bg-orange-50/50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="bg-orange-100 p-2 rounded-full">
              <CreditCard className="h-4 w-4 text-orange-600" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-orange-800">付款提醒</p>
              <p className="text-xs text-orange-600 leading-relaxed">有2笔待处理的付款事项，总金额 ¥560</p>
              <div className="flex gap-2 text-xs text-orange-600">
                <span>• 张先生家 ¥280</span>
                <span>• 王奶奶家 ¥280</span>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-orange-300 text-orange-700 bg-white hover:bg-orange-50 shrink-0"
              onClick={handlePaymentReminder}
            >
              立即处理
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            今日日程
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-primary" onClick={handleViewAllSchedule}>
            查看全部
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {todayAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
                appointment.status === "已完成"
                  ? "bg-gradient-to-r from-green-50 to-green-50/50 border-green-100"
                  : appointment.status === "进行中"
                    ? "bg-gradient-to-r from-blue-50 to-blue-50/50 border-blue-100"
                    : "bg-gradient-to-r from-orange-50 to-orange-50/50 border-orange-100"
              }`}
              onClick={() => handleAppointmentClick(appointment)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock
                    className={`h-4 w-4 ${
                      appointment.status === "已完成"
                        ? "text-green-600"
                        : appointment.status === "进行中"
                          ? "text-blue-600"
                          : "text-orange-600"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      appointment.status === "已完成"
                        ? "text-green-800"
                        : appointment.status === "进行中"
                          ? "text-blue-800"
                          : "text-orange-800"
                    }`}
                  >
                    {appointment.time}
                  </span>
                </div>
                <Badge
                  variant={appointment.status === "待服务" ? "outline" : "secondary"}
                  className={
                    appointment.status === "已完成"
                      ? "bg-green-100 text-green-700 border-green-200"
                      : appointment.status === "进行中"
                        ? "bg-blue-100 text-blue-700 border-blue-200"
                        : "text-orange-600 border-orange-300 bg-white"
                  }
                >
                  {appointment.status}
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm text-foreground">
                    {appointment.patientName}家 - {appointment.service}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {appointment.patient} | {appointment.address}
                  </span>
                </div>
              </div>
            </div>
          ))}
          <Button
            variant="outline"
            className="w-full mt-3 text-primary border-primary/20 bg-transparent"
            onClick={handleAddNewAppointment}
          >
            添加新预约
          </Button>
        </CardContent>
      </Card>

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
