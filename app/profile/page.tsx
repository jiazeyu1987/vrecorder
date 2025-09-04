"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useIsMobile } from "@/hooks/use-mobile"
import { useDeviceType } from "@/hooks/use-wechat-responsive"
import {
  User,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  Edit,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Award,
  ChevronRight,
  Lock,
  Eye,
  EyeOff,
  MessageSquare,
  FileText,
  AlertCircle,
  Clock,
  MessageCircle,
  CreditCard,
  RefreshCw,
} from "lucide-react"

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const isMobile = useIsMobile()
  const deviceType = useDeviceType()

  const [showEditModal, setShowEditModal] = useState(false)
  const [showAccountSettings, setShowAccountSettings] = useState(false)
  const [showNotificationSettings, setShowNotificationSettings] = useState(false)
  const [showPrivacySettings, setShowPrivacySettings] = useState(false)
  const [showHelpCenter, setShowHelpCenter] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [userProfile, setUserProfile] = useState({
    name: user?.name || "张医生",
    phone: user?.phone || "138****1234",
    email: "zhang.doctor@example.com",
    address: "北京市朝阳区医疗服务中心",
    workId: user?.workId || "HC001234",
    department: "居家护理部",
    level: "高级护理师",
    joinDate: "2020-03-15",
    bio: "专业从事居家医疗护理服务，擅长慢病管理和老年护理。",
  })

  const [notificationSettings, setNotificationSettings] = useState({
    appointmentReminders: true,
    paymentNotifications: true,
    systemUpdates: false,
    emergencyAlerts: true,
    patientMessages: true,
  })

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: true,
    locationSharing: false,
    dataAnalytics: true,
    thirdPartySharing: false,
  })

  const handleUpdateProfile = () => {
    console.log("[v0] Updating profile:", userProfile)
    setShowEditModal(false)
  }

  const handleAccountSettings = () => {
    setShowAccountSettings(true)
  }

  const handleNotificationSettings = () => {
    setShowNotificationSettings(true)
  }

  const handlePrivacySettings = () => {
    setShowPrivacySettings(true)
  }

  const handleHelpCenter = () => {
    setShowHelpCenter(true)
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      <main className={`pb-24 space-y-3 ${isMobile ? 'px-4' : 'px-6 max-w-2xl mx-auto'}`}>
        <Card className="shadow-none border-0 bg-white/70 backdrop-blur-sm rounded-2xl mt-4">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className={`${isMobile ? 'h-20 w-20' : 'h-24 w-24'} ring-2 ring-primary/20`}>
                <AvatarImage src="/caring-doctor.png" />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-xl font-semibold">张</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-800">{userProfile.name}</h2>
                <p className="text-sm text-gray-600 mt-1">{userProfile.level}</p>
                <Badge variant="secondary" className="text-xs mt-2 bg-primary/10 text-primary border-primary/20">
                  工号: {userProfile.workId}
                </Badge>
              </div>
              <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="rounded-full p-2 hover:bg-gray-100">
                    <Edit className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className={`${isMobile ? 'max-w-sm' : 'max-w-md'} rounded-2xl border-0 shadow-2xl bg-white/95 backdrop-blur-lg`}>
                  <DialogHeader>
                    <DialogTitle>编辑个人信息</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">姓名</Label>
                      <Input
                        id="name"
                        value={userProfile.name}
                        onChange={(e) => setUserProfile((prev) => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">电话</Label>
                      <Input
                        id="phone"
                        value={userProfile.phone}
                        onChange={(e) => setUserProfile((prev) => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">邮箱</Label>
                      <Input
                        id="email"
                        value={userProfile.email}
                        onChange={(e) => setUserProfile((prev) => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">个人简介</Label>
                      <Textarea
                        id="bio"
                        value={userProfile.bio}
                        onChange={(e) => setUserProfile((prev) => ({ ...prev, bio: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => setShowEditModal(false)}
                      >
                        取消
                      </Button>
                      <Button className="flex-1" onClick={handleUpdateProfile}>
                        保存
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className={`grid ${isMobile ? 'grid-cols-3' : 'grid-cols-3'} gap-6 text-center pt-6 border-t border-gray-100`}>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4">
                <div className="text-2xl font-bold text-blue-600">156</div>
                <div className="text-xs text-blue-700 mt-1">服务次数</div>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-4">
                <div className="text-2xl font-bold text-amber-600">4.9</div>
                <div className="text-xs text-amber-700 mt-1">服务评分</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4">
                <div className="text-2xl font-bold text-green-600">3年</div>
                <div className="text-xs text-green-700 mt-1">工作经验</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none border-0 bg-white/70 backdrop-blur-sm rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              个人信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-6">
            <div className="flex items-center gap-4 py-2">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Phone className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">{userProfile.phone}</span>
            </div>
            <div className="flex items-center gap-4 py-2">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <Mail className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">{userProfile.email}</span>
            </div>
            <div className="flex items-center gap-4 py-2">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                <MapPin className="h-5 w-5 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">{userProfile.address}</span>
            </div>
            <div className="flex items-center gap-4 py-2">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">入职时间: {userProfile.joinDate}</span>
            </div>
            <div className="flex items-center gap-4 py-2">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <Award className="h-5 w-5 text-indigo-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">{userProfile.department}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none border-0 bg-white/70 backdrop-blur-sm rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">我的功能</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 px-6">
            <Button
              variant="ghost"
              className="w-full justify-between p-4 h-auto bg-transparent hover:bg-gray-50/80 rounded-xl"
              onClick={handleAccountSettings}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Settings className="h-5 w-5 text-blue-600" />
                </div>
                <span className="font-medium text-gray-700">账户设置</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-between p-4 h-auto bg-transparent hover:bg-gray-50/80 rounded-xl"
              onClick={handleNotificationSettings}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                  <Bell className="h-5 w-5 text-green-600" />
                </div>
                <span className="font-medium text-gray-700">消息通知</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-between p-4 h-auto bg-transparent hover:bg-gray-50/80 rounded-xl"
              onClick={handlePrivacySettings}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                  <Shield className="h-5 w-5 text-orange-600" />
                </div>
                <span className="font-medium text-gray-700">隐私安全</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-between p-4 h-auto bg-transparent hover:bg-gray-50/80 rounded-xl"
              onClick={handleHelpCenter}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                  <HelpCircle className="h-5 w-5 text-purple-600" />
                </div>
                <span className="font-medium text-gray-700">帮助中心</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Button>
          </CardContent>
        </Card>

        <Button
          variant="outline"
          className="w-full bg-white/70 backdrop-blur-sm text-red-600 border-red-200 hover:bg-red-50/80 rounded-2xl py-4 font-medium shadow-none"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-2" />
          退出登录
        </Button>

        <Dialog open={showAccountSettings} onOpenChange={setShowAccountSettings}>
          <DialogContent className={`
            bg-white/98 backdrop-blur-xl border-0 shadow-2xl shadow-black/10
            ${deviceType === "mobile" ? "max-w-[95vw] mx-4 rounded-3xl" : "max-w-md rounded-2xl"}
          `}>
            <DialogHeader className={`border-b border-gray-100/50 ${deviceType === "mobile" ? "pb-4 mb-6" : "pb-3 mb-5"}`}>
              <DialogTitle className={`flex items-center gap-3 ${deviceType === "mobile" ? "text-xl" : "text-lg"}`}>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Settings className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-gray-800">账户设置</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* 密码修改区域 */}
              <div className="space-y-4">
                <h4 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                  <div className="w-5 h-5 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Lock className="h-3 w-3 text-orange-600" />
                  </div>
                  密码修改
                </h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="current-password" className="text-sm font-medium text-gray-700">当前密码</Label>
                    <div className="relative">
                      <Input 
                        id="current-password" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="请输入当前密码" 
                        className="rounded-xl border-gray-200/60 bg-gray-50/50 focus:bg-white transition-colors duration-200"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-sm font-medium text-gray-700">新密码</Label>
                    <Input 
                      id="new-password" 
                      type="password" 
                      placeholder="请输入新密码" 
                      className="rounded-xl border-gray-200/60 bg-gray-50/50 focus:bg-white transition-colors duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">确认新密码</Label>
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      placeholder="请再次输入新密码" 
                      className="rounded-xl border-gray-200/60 bg-gray-50/50 focus:bg-white transition-colors duration-200"
                    />
                  </div>
                </div>
              </div>
              
              {/* 账户安全 */}
              <div className="bg-gradient-to-r from-gray-50/80 to-blue-50/40 rounded-2xl p-4 border border-gray-100/50">
                <h4 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-5 h-5 bg-green-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-3 w-3 text-green-600" />
                  </div>
                  账户安全
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100/70 rounded-xl flex items-center justify-center">
                        <Lock className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-800">双重验证</span>
                        <p className="text-xs text-gray-600">提升账户安全性</p>
                      </div>
                    </div>
                    <Switch className="data-[state=checked]:bg-blue-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100/70 rounded-xl flex items-center justify-center">
                        <Bell className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-800">登录提醒</span>
                        <p className="text-xs text-gray-600">异地登录时通知</p>
                      </div>
                    </div>
                    <Switch defaultChecked className="data-[state=checked]:bg-green-500" />
                  </div>
                </div>
              </div>
              
              {/* 底部按钮组 */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className={`flex-1 rounded-xl border-gray-200/60 bg-gray-50/50 hover:bg-gray-100/60 text-gray-700 font-medium
                    ${deviceType === "mobile" ? "h-12 text-base" : "h-10 text-sm"} transition-all duration-200 active:scale-95`}
                  onClick={() => setShowAccountSettings(false)}
                >
                  取消
                </Button>
                <Button className={`flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 
                  shadow-lg shadow-blue-500/25 font-medium
                  ${deviceType === "mobile" ? "h-12 text-base" : "h-10 text-sm"} transition-all duration-200 active:scale-95`}>
                  保存设置
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showNotificationSettings} onOpenChange={setShowNotificationSettings}>
          <DialogContent className={`
            bg-white/98 backdrop-blur-xl border-0 shadow-2xl shadow-black/10
            ${deviceType === "mobile" ? "max-w-[95vw] mx-4 rounded-3xl" : "max-w-md rounded-2xl"}
          `}>
            <DialogHeader className={`border-b border-gray-100/50 ${deviceType === "mobile" ? "pb-4 mb-6" : "pb-3 mb-5"}`}>
              <DialogTitle className={`flex items-center gap-3 ${deviceType === "mobile" ? "text-xl" : "text-lg"}`}>
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <Bell className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-gray-800">消息通知</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5">
              {/* 服务相关通知 */}
              <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/40 rounded-2xl p-4 border border-blue-100/50">
                <h4 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-5 h-5 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-3 w-3 text-blue-600" />
                  </div>
                  服务相关
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100/70 rounded-xl flex items-center justify-center">
                        <Clock className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-800">预约提醒</div>
                        <div className="text-xs text-gray-600">服务前30分钟提醒</div>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.appointmentReminders}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({ ...prev, appointmentReminders: checked }))
                      }
                      className="data-[state=checked]:bg-orange-500"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100/70 rounded-xl flex items-center justify-center">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-800">紧急提醒</div>
                        <div className="text-xs text-gray-600">紧急预约和重要通知</div>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.emergencyAlerts}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({ ...prev, emergencyAlerts: checked }))
                      }
                      className="data-[state=checked]:bg-red-500"
                    />
                  </div>
                </div>
              </div>
              
              {/* 支付和消息通知 */}
              <div className="bg-gradient-to-r from-green-50/80 to-emerald-50/40 rounded-2xl p-4 border border-green-100/50">
                <h4 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-5 h-5 bg-green-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="h-3 w-3 text-green-600" />
                  </div>
                  支付和消息
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100/70 rounded-xl flex items-center justify-center">
                        <MessageCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-800">患者消息</div>
                        <div className="text-xs text-gray-600">患者发送的消息提醒</div>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.patientMessages}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({ ...prev, patientMessages: checked }))
                      }
                      className="data-[state=checked]:bg-green-500"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100/70 rounded-xl flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-800">支付通知</div>
                        <div className="text-xs text-gray-600">收款和退款提醒</div>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.paymentNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({ ...prev, paymentNotifications: checked }))
                      }
                      className="data-[state=checked]:bg-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              {/* 系统通知 */}
              <div className="bg-gradient-to-r from-purple-50/80 to-pink-50/40 rounded-2xl p-4 border border-purple-100/50">
                <h4 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-5 h-5 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Settings className="h-3 w-3 text-purple-600" />
                  </div>
                  系统通知
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100/70 rounded-xl flex items-center justify-center">
                        <RefreshCw className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-800">系统更新</div>
                        <div className="text-xs text-gray-600">应用更新和维护通知</div>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.systemUpdates}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({ ...prev, systemUpdates: checked }))
                      }
                      className="data-[state=checked]:bg-purple-500"
                    />
                  </div>
                </div>
              </div>
              
              {/* 底部按钮组 */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className={`flex-1 rounded-xl border-gray-200/60 bg-gray-50/50 hover:bg-gray-100/60 text-gray-700 font-medium
                    ${deviceType === "mobile" ? "h-12 text-base" : "h-10 text-sm"} transition-all duration-200 active:scale-95`}
                  onClick={() => setShowNotificationSettings(false)}
                >
                  取消
                </Button>
                <Button className={`flex-1 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 
                  shadow-lg shadow-green-500/25 font-medium
                  ${deviceType === "mobile" ? "h-12 text-base" : "h-10 text-sm"} transition-all duration-200 active:scale-95`}>
                  保存设置
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showPrivacySettings} onOpenChange={setShowPrivacySettings}>
          <DialogContent className={`
            bg-white/98 backdrop-blur-xl border-0 shadow-2xl shadow-black/10
            ${deviceType === "mobile" ? "max-w-[95vw] mx-4 rounded-3xl" : "max-w-md rounded-2xl"}
          `}>
            <DialogHeader className={`border-b border-gray-100/50 ${deviceType === "mobile" ? "pb-4 mb-6" : "pb-3 mb-5"}`}>
              <DialogTitle className={`flex items-center gap-3 ${deviceType === "mobile" ? "text-xl" : "text-lg"}`}>
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-gray-800">隐私安全</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5">
              {/* 个人信息设置 */}
              <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/40 rounded-2xl p-4 border border-blue-100/50">
                <h4 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-5 h-5 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="h-3 w-3 text-blue-600" />
                  </div>
                  个人信息
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100/70 rounded-xl flex items-center justify-center">
                        <Eye className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-800">个人资料可见性</div>
                        <div className="text-xs text-gray-600">允许患者查看基本信息</div>
                      </div>
                    </div>
                    <Switch
                      checked={privacySettings.profileVisibility}
                      onCheckedChange={(checked) =>
                        setPrivacySettings((prev) => ({ ...prev, profileVisibility: checked }))
                      }
                      className="data-[state=checked]:bg-blue-500"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100/70 rounded-xl flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-800">位置共享</div>
                        <div className="text-xs text-gray-600">服务时共享实时位置</div>
                      </div>
                    </div>
                    <Switch
                      checked={privacySettings.locationSharing}
                      onCheckedChange={(checked) => setPrivacySettings((prev) => ({ ...prev, locationSharing: checked }))}
                      className="data-[state=checked]:bg-green-500"
                    />
                  </div>
                </div>
              </div>
              
              {/* 数据使用设置 */}
              <div className="bg-gradient-to-r from-purple-50/80 to-pink-50/40 rounded-2xl p-4 border border-purple-100/50">
                <h4 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-5 h-5 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Settings className="h-3 w-3 text-purple-600" />
                  </div>
                  数据使用
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100/70 rounded-xl flex items-center justify-center">
                        <FileText className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-800">数据分析</div>
                        <div className="text-xs text-gray-600">帮助改善服务质量</div>
                      </div>
                    </div>
                    <Switch
                      checked={privacySettings.dataAnalytics}
                      onCheckedChange={(checked) => setPrivacySettings((prev) => ({ ...prev, dataAnalytics: checked }))}
                      className="data-[state=checked]:bg-purple-500"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100/70 rounded-xl flex items-center justify-center">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-800">第三方共享</div>
                        <div className="text-xs text-gray-600">与合作医疗机构共享</div>
                      </div>
                    </div>
                    <Switch
                      checked={privacySettings.thirdPartySharing}
                      onCheckedChange={(checked) =>
                        setPrivacySettings((prev) => ({ ...prev, thirdPartySharing: checked }))
                      }
                      className="data-[state=checked]:bg-orange-500"
                    />
                  </div>
                </div>
              </div>
              
              {/* 账户操作 */}
              <div className="bg-gradient-to-r from-gray-50/80 to-slate-50/40 rounded-2xl p-4 border border-gray-100/50">
                <h4 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-5 h-5 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Lock className="h-3 w-3 text-gray-600" />
                  </div>
                  账户操作
                </h4>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start rounded-xl border-gray-200/60 bg-white/70 hover:bg-gray-50/80 text-gray-700 transition-all duration-200 active:scale-95"
                  >
                    <Lock className="h-4 w-4 mr-3 text-gray-600" />
                    <div className="text-left">
                      <div className="font-medium">数据导出</div>
                      <div className="text-xs text-gray-500">下载个人数据副本</div>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start rounded-xl border-red-200/60 bg-red-50/40 hover:bg-red-50/60 text-red-600 transition-all duration-200 active:scale-95"
                  >
                    <AlertCircle className="h-4 w-4 mr-3 text-red-600" />
                    <div className="text-left">
                      <div className="font-medium">删除账户</div>
                      <div className="text-xs text-red-500">永久删除所有数据</div>
                    </div>
                  </Button>
                </div>
              </div>
              
              {/* 底部按钮组 */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className={`flex-1 rounded-xl border-gray-200/60 bg-gray-50/50 hover:bg-gray-100/60 text-gray-700 font-medium
                    ${deviceType === "mobile" ? "h-12 text-base" : "h-10 text-sm"} transition-all duration-200 active:scale-95`}
                  onClick={() => setShowPrivacySettings(false)}
                >
                  取消
                </Button>
                <Button className={`flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 
                  shadow-lg shadow-orange-500/25 font-medium
                  ${deviceType === "mobile" ? "h-12 text-base" : "h-10 text-sm"} transition-all duration-200 active:scale-95`}>
                  保存设置
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showHelpCenter} onOpenChange={setShowHelpCenter}>
          <DialogContent className={`
            bg-white/98 backdrop-blur-xl border-0 shadow-2xl shadow-black/10
            ${deviceType === "mobile" ? "max-w-[95vw] mx-4 rounded-3xl" : "max-w-md rounded-2xl"}
          `}>
            <DialogHeader className={`border-b border-gray-100/50 ${deviceType === "mobile" ? "pb-4 mb-6" : "pb-3 mb-5"}`}>
              <DialogTitle className={`flex items-center gap-3 ${deviceType === "mobile" ? "text-xl" : "text-lg"}`}>
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <HelpCircle className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-gray-800">帮助中心</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* 帮助选项列表 */}
              <div className="space-y-3">
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start rounded-2xl bg-gradient-to-r from-blue-50/60 to-indigo-50/40 
                    hover:from-blue-100/60 hover:to-indigo-100/40 border border-blue-100/50 transition-all duration-200 active:scale-95
                    ${deviceType === "mobile" ? "p-4 h-auto" : "p-3 h-auto"}`}
                >
                  <div className="flex items-center gap-4 w-full">
                    <div className="w-10 h-10 bg-blue-100/70 rounded-xl flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-semibold text-gray-800">常见问题</div>
                      <div className="text-xs text-gray-600 mt-1">查看常见问题解答</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </Button>
                
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start rounded-2xl bg-gradient-to-r from-green-50/60 to-emerald-50/40 
                    hover:from-green-100/60 hover:to-emerald-100/40 border border-green-100/50 transition-all duration-200 active:scale-95
                    ${deviceType === "mobile" ? "p-4 h-auto" : "p-3 h-auto"}`}
                >
                  <div className="flex items-center gap-4 w-full">
                    <div className="w-10 h-10 bg-green-100/70 rounded-xl flex items-center justify-center">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-semibold text-gray-800">使用指南</div>
                      <div className="text-xs text-gray-600 mt-1">详细的功能使用说明</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </Button>
                
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start rounded-2xl bg-gradient-to-r from-orange-50/60 to-amber-50/40 
                    hover:from-orange-100/60 hover:to-amber-100/40 border border-orange-100/50 transition-all duration-200 active:scale-95
                    ${deviceType === "mobile" ? "p-4 h-auto" : "p-3 h-auto"}`}
                >
                  <div className="flex items-center gap-4 w-full">
                    <div className="w-10 h-10 bg-orange-100/70 rounded-xl flex items-center justify-center">
                      <Phone className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-semibold text-gray-800">联系客服</div>
                      <div className="text-xs text-gray-600 mt-1">400-123-4567</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </Button>
                
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start rounded-2xl bg-gradient-to-r from-purple-50/60 to-pink-50/40 
                    hover:from-purple-100/60 hover:to-pink-100/40 border border-purple-100/50 transition-all duration-200 active:scale-95
                    ${deviceType === "mobile" ? "p-4 h-auto" : "p-3 h-auto"}`}
                >
                  <div className="flex items-center gap-4 w-full">
                    <div className="w-10 h-10 bg-purple-100/70 rounded-xl flex items-center justify-center">
                      <Mail className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-semibold text-gray-800">意见反馈</div>
                      <div className="text-xs text-gray-600 mt-1">help@healthcare.com</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </Button>
              </div>
              
              {/* 分割线 */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                <div className="text-xs text-gray-400 font-medium">系统信息</div>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
              </div>
              
              {/* 系统信息 */}
              <div className="bg-gradient-to-r from-gray-50/60 to-slate-50/40 rounded-2xl p-4 border border-gray-100/50">
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Settings className="h-3 w-3 text-gray-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">健康记录员 v1.2.0</span>
                  </div>
                  <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                    <button className="hover:text-blue-600 transition-colors duration-200 underline-offset-2 hover:underline">
                      服务条款
                    </button>
                    <span>|</span>
                    <button className="hover:text-blue-600 transition-colors duration-200 underline-offset-2 hover:underline">
                      隐私政策
                    </button>
                  </div>
                </div>
              </div>
              
              {/* 关闭按钮 */}
              <Button 
                variant="outline" 
                className={`w-full rounded-xl border-gray-200/60 bg-gray-50/50 hover:bg-gray-100/60 text-gray-700 font-medium
                  ${deviceType === "mobile" ? "h-12 text-base" : "h-10 text-sm"} transition-all duration-200 active:scale-95`}
                onClick={() => setShowHelpCenter(false)}
              >
                关闭
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
      <BottomNavigation activeTab="profile" />
    </div>
  )
}
