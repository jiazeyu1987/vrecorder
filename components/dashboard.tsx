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
    router.push("/")
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
    router.push("/")
  }

  const handleAddNewAppointment = () => {
    router.push("/")
  }

  const handleTaskClick = (taskType: string) => {
    if (taskType === "pending" || taskType === "inProgress") {
      router.push(`/records?taskType=${taskType}`)
    } else {
      setSelectedTaskType(taskType)
      setShowTaskDetails(true)
    }
  }

  const handleWeeklyStatsClick = () => {
    setShowWeeklyStats(true)
  }

  const handleFinanceClick = (financeType: string) => {
    setSelectedFinanceType(financeType)
    setShowFinanceDetails(true)
  }

  const handleAppointmentClick = (appointment: any) => {
    if (appointment.status === "待服务" || appointment.status === "进行中") {
      router.push(
        `/records?patientId=${appointment.id}&patientName=${encodeURIComponent(appointment.patientName)}&service=${encodeURIComponent(appointment.service)}&time=${encodeURIComponent(appointment.time)}&address=${encodeURIComponent(appointment.address)}`,
      )
    } else {
      setSelectedAppointment(appointment)
      setShowAppointmentDetails(true)
    }
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
    // 跳转到记录页面并传递家庭信息和自动开始标志
    const params = new URLSearchParams({
      familyName: appointment.patientName || '',
      service: appointment.service || '',
      time: appointment.time || '',
      address: appointment.address || '',
      autoStart: 'true' // 标志自动开始录音
    })
    router.push(`/records?${params.toString()}`)
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
      {/* 顶部状态栏 - 已隐藏 */}

      {/* 紧急提醒卡片 - 已隐藏 */}

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

            {/* 财务状况部分 - 已隐藏 */}
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

      {/* 付款提醒卡片 - 已隐藏 */}

      {/* 今日日程卡片 - 已隐藏 */}

      {/* 任务详情模态框 */}
      {showTaskDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">
              {selectedTaskType === "pending" && "待服务任务"}
              {selectedTaskType === "inProgress" && "进行中任务"}
              {selectedTaskType === "completed" && "已完成任务"}
            </h3>
            <div className="space-y-3">{/* Task details will be fetched based on taskType from records page */}</div>
            <Button variant="outline" className="w-full mt-4 bg-transparent" onClick={() => setShowTaskDetails(false)}>
              关闭
            </Button>
          </div>
        </div>
      )}

      {/* 本周统计模态框 */}
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

      {/* 财务详情模态框 */}
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

      {/* 预约详情模态框 */}
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
              <Button variant="outline" onClick={() => router.push("/")}>
                查看日程
              </Button>
              <Button variant="outline" onClick={() => setShowAppointmentDetails(false)}>
                关闭
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 联系医生模态框 */}
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
