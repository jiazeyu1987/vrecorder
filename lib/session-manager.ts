/**
 * 会话管理工具
 * 处理用户会话的创建、验证和清理
 */

export interface SessionData {
  user: {
    name: string
    phone: string
    workId: string
  }
  loginTime: number
  sessionExpiry: number
  rememberMe: boolean
}

export class SessionManager {
  private static readonly SESSION_DURATION = 2 * 60 * 60 * 1000 // 2小时
  private static readonly REMEMBER_ME_DURATION = 7 * 24 * 60 * 60 * 1000 // 7天
  private static readonly STORAGE_KEYS = {
    IS_AUTHENTICATED: "isAuthenticated",
    USER_INFO: "userInfo",
    LOGIN_TIME: "loginTime",
    SESSION_EXPIRY: "sessionExpiry",
    REMEMBER_ME: "rememberMe",
  }

  /**
   * 创建新的会话
   */
  static createSession(user: SessionData["user"], rememberMe: boolean = false): void {
    const now = Date.now()
    const sessionExpiry = now + SessionManager.SESSION_DURATION

    localStorage.setItem(SessionManager.STORAGE_KEYS.IS_AUTHENTICATED, "true")
    localStorage.setItem(SessionManager.STORAGE_KEYS.USER_INFO, JSON.stringify(user))
    localStorage.setItem(SessionManager.STORAGE_KEYS.LOGIN_TIME, now.toString())
    localStorage.setItem(SessionManager.STORAGE_KEYS.SESSION_EXPIRY, sessionExpiry.toString())
    localStorage.setItem(SessionManager.STORAGE_KEYS.REMEMBER_ME, rememberMe.toString())
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 会话已创建:', {
        user: user.name,
        rememberMe,
        sessionExpiry: new Date(sessionExpiry).toLocaleString(),
        willExpireInDays: rememberMe ? 7 : 0
      })
    }
  }

  /**
   * 获取当前会话数据
   */
  static getSession(): SessionData | null {
    try {
      const isAuthenticated = localStorage.getItem(SessionManager.STORAGE_KEYS.IS_AUTHENTICATED)
      const userInfo = localStorage.getItem(SessionManager.STORAGE_KEYS.USER_INFO)
      const loginTime = localStorage.getItem(SessionManager.STORAGE_KEYS.LOGIN_TIME)
      const sessionExpiry = localStorage.getItem(SessionManager.STORAGE_KEYS.SESSION_EXPIRY)
      const rememberMe = localStorage.getItem(SessionManager.STORAGE_KEYS.REMEMBER_ME)

      if (!isAuthenticated || !userInfo || !loginTime || !sessionExpiry) {
        return null
      }

      return {
        user: JSON.parse(userInfo),
        loginTime: parseInt(loginTime),
        sessionExpiry: parseInt(sessionExpiry),
        rememberMe: rememberMe === "true",
      }
    } catch (error) {
      console.error("获取会话数据失败:", error)
      return null
    }
  }

  /**
   * 验证会话是否有效
   */
  static validateSession(): { isValid: boolean; reason?: string } {
    const session = SessionManager.getSession()
    
    if (!session) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🚫 未找到会话数据')
      }
      return { isValid: false, reason: "no_session" }
    }

    const now = Date.now()

    // 检查session是否过期
    if (now > session.sessionExpiry) {
      // 如果勾选了记住我，检查是否在7天内
      if (session.rememberMe) {
        const daysSinceLogin = (now - session.loginTime) / (24 * 60 * 60 * 1000)
        if (daysSinceLogin <= 7) {
          // 在7天内，刷新session
          const refreshed = SessionManager.refreshSession()
          if (refreshed) {
            if (process.env.NODE_ENV === 'development') {
              console.log('🔄 会话已自动刷新 (记住我模式)', {
                daysSinceLogin: daysSinceLogin.toFixed(1)
              })
            }
            return { isValid: true, reason: "auto_refresh" }
          }
        }
        // 记住我已过期，清理session
        if (process.env.NODE_ENV === 'development') {
          console.log('⏰ 记住我已过期', {
            daysSinceLogin: daysSinceLogin.toFixed(1),
            maxDays: 7
          })
        }
        return { isValid: false, reason: "remember_me_expired" }
      } else {
        // 未勾选记住我且session过期
        if (process.env.NODE_ENV === 'development') {
          console.log('⏰ 会话已过期 (未勾选记住我)')
        }
        return { isValid: false, reason: "session_expired" }
      }
    }

    if (process.env.NODE_ENV === 'development') {
      const timeLeft = session.sessionExpiry - now
      console.log('✅ 会话有效', {
        timeLeftMinutes: Math.floor(timeLeft / (1000 * 60)),
        rememberMe: session.rememberMe
      })
    }

    return { isValid: true }
  }

  /**
   * 刷新会话（延长过期时间）
   */
  static refreshSession(): boolean {
    const session = SessionManager.getSession()
    
    if (!session) {
      return false
    }

    const newSessionExpiry = Date.now() + SessionManager.SESSION_DURATION
    localStorage.setItem(SessionManager.STORAGE_KEYS.SESSION_EXPIRY, newSessionExpiry.toString())
    
    return true
  }

  /**
   * 清除会话
   */
  static clearSession(): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('🧹 清除会话数据')
    }
    Object.values(SessionManager.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
  }

  /**
   * 获取会话剩余时间（毫秒）
   */
  static getSessionTimeLeft(): number {
    const session = SessionManager.getSession()
    
    if (!session) {
      return 0
    }

    return Math.max(0, session.sessionExpiry - Date.now())
  }

  /**
   * 检查是否需要刷新会话（剩余时间少于30分钟时）
   */
  static shouldRefreshSession(): boolean {
    const timeLeft = SessionManager.getSessionTimeLeft()
    const thirtyMinutes = 30 * 60 * 1000
    
    return timeLeft > 0 && timeLeft < thirtyMinutes
  }
}