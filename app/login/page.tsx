"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Heart, AlertCircle, CheckCircle2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/components/auth-provider"
import { AuthService } from "@/app/api/auth"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [rememberMe, setRememberMe] = useState(false)
  const { login, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  // 如果用户已经登录，直接跳转到主页
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, authLoading, router])

  // 在认证状态加载中时，显示加载界面
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="text-center space-y-6">
          {/* Logo with loading animation */}
          <div className="relative mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
              <Heart className="h-10 w-10 text-white" fill="currentColor" />
            </div>
            {/* Loading ring */}
            <div className="absolute inset-0 w-20 h-20 border-4 border-green-200 border-t-green-500 rounded-3xl animate-spin"></div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-lg font-medium text-gray-700">健康小助手</h2>
            <p className="text-gray-500 text-sm">正在检查登录状态...</p>
          </div>
        </div>
      </div>
    )
  }

  // 如果已经认证，不显示登录表单（避免闪烁）
  if (isAuthenticated) {
    return null
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // 调用后端API进行认证
      const result = await AuthService.login(formData.username, formData.password)
      
      if (result.success && result.user && result.tokens) {
        // 转换用户数据格式以匹配客户端需求
        const userData = {
          id: result.user.id,
          username: result.user.username,
          name: result.user.name,
          phone: formData.username,
          workId: result.user.username, // 使用username作为workId
          role: result.user.role,
          avatar: result.user.avatar,
          status: result.user.status,
          created_at: result.user.created_at,
        }
        
        // 使用AuthProvider的login方法，并传递记住我选项
        // 注意：需要转换属性名from access_token/refresh_token to accessToken/refreshToken
        const tokens = {
          accessToken: result.tokens.access_token,
          refreshToken: result.tokens.refresh_token
        }
        login(userData, tokens, rememberMe)
        router.push("/")
      } else {
        setError(result.error || "登录失败")
      }
    } catch (err) {
      setError("网络错误，请检查网络连接")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-100 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-100 rounded-full opacity-20 blur-3xl"></div>
      </div>
      
      <div className="relative w-full max-w-sm sm:max-w-md space-y-6 sm:space-y-8">
        {/* 头部logo和标题 */}
        <div className="text-center space-y-4">
          <div className="relative mx-auto">
            {/* 主logo */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-green-200">
              <Heart className="h-10 w-10 sm:h-12 sm:w-12 text-white" fill="currentColor" />
            </div>
            {/* 装饰圆点 */}
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-3 w-3 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              健康小助手
            </h1>
            <p className="text-gray-500 text-sm sm:text-base">医疗记录 · 贴心管理</p>
          </div>
        </div>

        {/* 登录卡片 */}
        <Card className="border-0 shadow-xl shadow-gray-200/50 bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleLogin} className="space-y-5">
              {/* 手机号输入 */}
              <div className="space-y-3">
                <Label htmlFor="phone" className="text-gray-700 font-medium text-sm">
                  用户名/手机号
                </Label>
                <div className="relative">
                  <Input
                    id="phone"
                    type="text"
                    placeholder="请输入用户名或手机号"
                    value={formData.username}
                    onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                    className="h-12 rounded-2xl border-2 border-gray-100 focus:border-green-400 focus:ring-0 pl-4 pr-4 text-base placeholder:text-gray-400 bg-gray-50/50 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* 密码输入 */}
              <div className="space-y-3">
                <Label htmlFor="password" className="text-gray-700 font-medium text-sm">
                  登录密码
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="请输入您的密码"
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    className="h-12 rounded-2xl border-2 border-gray-100 focus:border-green-400 focus:ring-0 pl-4 pr-12 text-base placeholder:text-gray-400 bg-gray-50/50 transition-all duration-200"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* 记住我选项 */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="rounded-md data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                    7天内自动登录
                  </Label>
                </div>
                <button 
                  type="button" 
                  className="text-sm text-green-600 hover:text-green-700 transition-colors"
                >
                  忘记密码?
                </button>
              </div>

              {/* 错误提示 */}
              {error && (
                <div className="flex items-center gap-3 text-sm text-red-600 bg-red-50 border border-red-100 p-4 rounded-2xl">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* 登录按钮 */}
              <Button 
                type="submit" 
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium text-base shadow-lg shadow-green-200 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>登录中...</span>
                  </div>
                ) : (
                  "立即登录"
                )}
              </Button>
            </form>

            {/* 测试账号信息 */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl border border-blue-100">
              <div className="text-center space-y-1">
                <p className="text-xs text-gray-500 mb-2">📱 测试账号</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">管理员:</span>
                    <span className="font-medium text-gray-800 font-mono">admin / admin123</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">记录员:</span>
                    <span className="font-medium text-gray-800 font-mono">recorder002 / recorder123</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">医生:</span>
                    <span className="font-medium text-gray-800 font-mono">doctor001 / doctor123</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 底部条款 */}
        <div className="text-center px-4">
          <p className="text-xs text-gray-400 leading-relaxed">
            登录即表示您同意我们的
            <button className="text-green-600 hover:text-green-700 mx-1 underline">
              服务条款
            </button>
            和
            <button className="text-green-600 hover:text-green-700 mx-1 underline">
              隐私政策
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
