"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

interface User {
  name: string
  phone: string
  workId: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem("isAuthenticated")
      const userInfo = localStorage.getItem("userInfo")

      if (authStatus === "true" && userInfo) {
        const parsedUser = JSON.parse(userInfo)
        setUser(parsedUser)
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
        setUser(null)
        if (pathname !== "/login") {
          router.push("/login")
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [pathname, router])

  const login = (userData: User) => {
    setUser(userData)
    setIsAuthenticated(true)
    localStorage.setItem("isAuthenticated", "true")
    localStorage.setItem("userInfo", JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userInfo")
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, isLoading }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
