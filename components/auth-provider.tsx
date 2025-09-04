"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { SessionManager, UserData } from "@/lib/session-manager"

interface AuthContextType {
  user: UserData | null
  isAuthenticated: boolean
  login: (user: UserData, tokens: { accessToken: string; refreshToken: string }, rememberMe?: boolean) => void
  logout: () => void
  isLoading: boolean
  checkAuthStatus: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // 检查认证状态
  const checkAuthStatus = async (): Promise<void> => {
    try {
      const validation = SessionManager.validateSession()
      
      if (validation.isValid) {
        const session = SessionManager.getSession()
        if (session) {
          setUser(session.user)
          setIsAuthenticated(true)
          
          // 如果会话快过期了，自动刷新
          if (SessionManager.shouldRefreshSession()) {
            SessionManager.refreshSession()
          }
        }
      } else {
        // 清理无效的会话状态
        setUser(null)
        setIsAuthenticated(false)
        SessionManager.clearSession()
        
        // 根据失效原因显示不同的提示
        if (validation.reason === "session_expired") {
          console.log("会话已过期，请重新登录")
        } else if (validation.reason === "remember_me_expired") {
          console.log("自动登录已过期，请重新登录")
        }
        
        // 只有在不是登录页面且当前状态为已认证时才重定向，避免重复重定向
        if (pathname !== "/login" && isAuthenticated) {
          router.push("/login")
        }
      }
    } catch (error) {
      console.error("检查认证状态失败:", error)
      // 出现错误时清理状态
      setUser(null)
      setIsAuthenticated(false)
      SessionManager.clearSession()
      
      // 只有在不是登录页面且当前状态为已认证时才重定向
      if (pathname !== "/login" && isAuthenticated) {
        router.push("/login")
      }
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      await checkAuthStatus()
      setIsLoading(false)
    }

    initAuth()
  }, []) // 移除pathname和router依赖，避免无限循环

  // 单独处理路由变化 - 只在特定情况下检查认证状态
  useEffect(() => {
    if (!isLoading) {
      // 只在访问需要认证的页面时检查，避免在已认证页面间跳转时重复检查
      const needsAuth = pathname !== "/login" && pathname !== "/register"
      if (needsAuth && !isAuthenticated) {
        checkAuthStatus()
      }
    }
  }, [pathname, isAuthenticated, isLoading])

  // 设置定时检查和页面可见性监听
  useEffect(() => {
    // 设置定时检查（每3分钟检查一次），只在已认证状态下定期检查
    const interval = setInterval(() => {
      if (isAuthenticated) {
        checkAuthStatus()
      }
    }, 3 * 60 * 1000)
    
    // 监听页面可见性变化，当页面重新变为可见时检查认证状态
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isLoading && isAuthenticated) {
        checkAuthStatus()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isLoading, isAuthenticated])

  const login = (userData: UserData, tokens: { accessToken: string; refreshToken: string }, rememberMe: boolean = false) => {
    setUser(userData)
    setIsAuthenticated(true)
    
    // 使用SessionManager创建会话
    SessionManager.createSession(userData, tokens, rememberMe)
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    SessionManager.clearSession()
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, isLoading, checkAuthStatus }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
