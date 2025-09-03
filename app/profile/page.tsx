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
} from "lucide-react"

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const isMobile = useIsMobile()

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
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>账户设置</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">当前密码</Label>
                <div className="relative">
                  <Input id="current-password" type={showPassword ? "text" : "password"} placeholder="请输入当前密码" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">新密码</Label>
                <Input id="new-password" type="password" placeholder="请输入新密码" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">确认新密码</Label>
                <Input id="confirm-password" type="password" placeholder="请再次输入新密码" />
              </div>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-medium">账户安全</h4>
                <div className="flex items-center justify-between">
                  <span className="text-sm">双重验证</span>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">登录提醒</span>
                  <Switch defaultChecked />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => setShowAccountSettings(false)}
                >
                  取消
                </Button>
                <Button className="flex-1">保存设置</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showNotificationSettings} onOpenChange={setShowNotificationSettings}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>消息通知</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">预约提醒</div>
                    <div className="text-xs text-muted-foreground">服务前30分钟提醒</div>
                  </div>
                  <Switch
                    checked={notificationSettings.appointmentReminders}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, appointmentReminders: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">支付通知</div>
                    <div className="text-xs text-muted-foreground">收款和退款提醒</div>
                  </div>
                  <Switch
                    checked={notificationSettings.paymentNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, paymentNotifications: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">系统更新</div>
                    <div className="text-xs text-muted-foreground">应用更新和维护通知</div>
                  </div>
                  <Switch
                    checked={notificationSettings.systemUpdates}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, systemUpdates: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">紧急提醒</div>
                    <div className="text-xs text-muted-foreground">紧急预约和重要通知</div>
                  </div>
                  <Switch
                    checked={notificationSettings.emergencyAlerts}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, emergencyAlerts: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">患者消息</div>
                    <div className="text-xs text-muted-foreground">患者发送的消息提醒</div>
                  </div>
                  <Switch
                    checked={notificationSettings.patientMessages}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, patientMessages: checked }))
                    }
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => setShowNotificationSettings(false)}
                >
                  取消
                </Button>
                <Button className="flex-1">保存设置</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showPrivacySettings} onOpenChange={setShowPrivacySettings}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>隐私安全</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">个人资料可见性</div>
                    <div className="text-xs text-muted-foreground">允许患者查看基本信息</div>
                  </div>
                  <Switch
                    checked={privacySettings.profileVisibility}
                    onCheckedChange={(checked) =>
                      setPrivacySettings((prev) => ({ ...prev, profileVisibility: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">位置共享</div>
                    <div className="text-xs text-muted-foreground">服务时共享实时位置</div>
                  </div>
                  <Switch
                    checked={privacySettings.locationSharing}
                    onCheckedChange={(checked) => setPrivacySettings((prev) => ({ ...prev, locationSharing: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">数据分析</div>
                    <div className="text-xs text-muted-foreground">帮助改善服务质量</div>
                  </div>
                  <Switch
                    checked={privacySettings.dataAnalytics}
                    onCheckedChange={(checked) => setPrivacySettings((prev) => ({ ...prev, dataAnalytics: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">第三方共享</div>
                    <div className="text-xs text-muted-foreground">与合作医疗机构共享</div>
                  </div>
                  <Switch
                    checked={privacySettings.thirdPartySharing}
                    onCheckedChange={(checked) =>
                      setPrivacySettings((prev) => ({ ...prev, thirdPartySharing: checked }))
                    }
                  />
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Button variant="outline" className="w-full bg-transparent">
                  <Lock className="h-4 w-4 mr-2" />
                  数据导出
                </Button>
                <Button variant="outline" className="w-full bg-transparent text-red-600 border-red-300">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  删除账户
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => setShowPrivacySettings(false)}
                >
                  取消
                </Button>
                <Button className="flex-1">保存设置</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showHelpCenter} onOpenChange={setShowHelpCenter}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>帮助中心</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Button variant="ghost" className="w-full justify-start p-3 h-auto bg-transparent">
                <MessageSquare className="h-4 w-4 mr-3 text-muted-foreground" />
                <div className="text-left">
                  <div className="font-medium">常见问题</div>
                  <div className="text-xs text-muted-foreground">查看常见问题解答</div>
                </div>
              </Button>
              <Button variant="ghost" className="w-full justify-start p-3 h-auto bg-transparent">
                <FileText className="h-4 w-4 mr-3 text-muted-foreground" />
                <div className="text-left">
                  <div className="font-medium">使用指南</div>
                  <div className="text-xs text-muted-foreground">详细的功能使用说明</div>
                </div>
              </Button>
              <Button variant="ghost" className="w-full justify-start p-3 h-auto bg-transparent">
                <Phone className="h-4 w-4 mr-3 text-muted-foreground" />
                <div className="text-left">
                  <div className="font-medium">联系客服</div>
                  <div className="text-xs text-muted-foreground">400-123-4567</div>
                </div>
              </Button>
              <Button variant="ghost" className="w-full justify-start p-3 h-auto bg-transparent">
                <Mail className="h-4 w-4 mr-3 text-muted-foreground" />
                <div className="text-left">
                  <div className="font-medium">意见反馈</div>
                  <div className="text-xs text-muted-foreground">help@healthcare.com</div>
                </div>
              </Button>
              <Separator />
              <div className="text-center text-xs text-muted-foreground py-2">版本 1.2.0 | 服务条款 | 隐私政策</div>
              <Button variant="outline" className="w-full bg-transparent" onClick={() => setShowHelpCenter(false)}>
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
