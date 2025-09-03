"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Calendar, Users, User, FileText } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { useDeviceType } from "@/hooks/use-wechat-responsive"

interface BottomNavigationProps {
  activeTab?: string
}

const navItems = [
  {
    id: "home",
    label: "首页",
    icon: Home,
    href: "/",
  },
  {
    id: "schedule",
    label: "日程",
    icon: Calendar,
    href: "/schedule",
  },
  {
    id: "records",
    label: "记录",
    icon: FileText,
    href: "/records",
  },
  {
    id: "patients",
    label: "患者",
    icon: Users,
    href: "/patients",
  },
  {
    id: "profile",
    label: "我的",
    icon: User,
    href: "/profile",
  },
]

export function BottomNavigation({ activeTab }: BottomNavigationProps) {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const deviceType = useDeviceType()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/98 backdrop-blur-lg border-t border-gray-100/50 z-50 shadow-2xl">
      <div
        className={cn(
          "flex items-center justify-around px-2 transition-all duration-200",
          deviceType === "mobile" ? "h-20 pb-safe" : deviceType === "tablet" ? "h-18" : "h-16",
          "max-w-screen-lg mx-auto",
        )}
      >
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id || pathname === item.href
          const isRecordsTab = item.id === "records"
          const isPatientsTab = item.id === "patients"

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl transition-all duration-300",
                "min-w-0 flex-1 relative transform active:scale-95",
                "group hover:bg-gray-50/80",
                isActive ? "text-primary" : "text-gray-600 hover:text-gray-800",
                isRecordsTab && deviceType === "mobile" && "scale-110 mx-2",
                isRecordsTab && deviceType === "tablet" && "scale-105 mx-1",
                isPatientsTab && deviceType === "mobile" && "scale-110 mx-2",
                isPatientsTab && deviceType === "tablet" && "scale-105 mx-1",
              )}
            >
              <div className="relative flex flex-col items-center gap-1">
                {/* 微信小程序风格的记录页签和患者页签 */}
                {(isRecordsTab || isPatientsTab) ? (
                  <div className="relative flex flex-col items-center">
                    {/* 主图标容器 - 微信风格圆形背景 */}
                    <div
                      className={cn(
                        "relative flex items-center justify-center transition-all duration-300",
                        "rounded-full border-2 border-white/50 shadow-lg",
                        // 记录页签使用绿色渐变
                        isRecordsTab && "bg-gradient-to-br from-green-400 via-green-500 to-green-600",
                        // 患者页签使用蓝色渐变（微信风格的主要色彩）
                        isPatientsTab && "bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600",
                        // 响应式大小
                        deviceType === "mobile" ? "w-12 h-12" : deviceType === "tablet" ? "w-10 h-10" : "w-9 h-9",
                        // 激活状态效果
                        isActive ? [
                          "shadow-xl scale-110 transform",
                          isRecordsTab && "shadow-green-500/60 ring-3 ring-green-300/70 ring-offset-2 ring-offset-white",
                          isPatientsTab && "shadow-blue-500/60 ring-3 ring-blue-300/70 ring-offset-2 ring-offset-white",
                        ] : [
                          "hover:scale-105 hover:shadow-xl transform",
                          isRecordsTab && "hover:shadow-green-500/50 hover:ring-2 hover:ring-green-300/50 hover:ring-offset-1 hover:ring-offset-white",
                          isPatientsTab && "hover:shadow-blue-500/50 hover:ring-2 hover:ring-blue-300/50 hover:ring-offset-1 hover:ring-offset-white",
                        ]
                      )}
                    >
                      <Icon
                        className={cn(
                          "text-white drop-shadow-lg transition-all duration-300",
                          deviceType === "mobile" ? "h-6 w-6" : deviceType === "tablet" ? "h-5 w-5" : "h-4 w-4",
                          isActive && "scale-110 drop-shadow-2xl"
                        )}
                      />
                      
                      {/* 微信风格的活跃状态光环效果 */}
                      {isActive && (
                        <>
                          <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse" />
                          <div className={cn(
                            "absolute -inset-2 rounded-full blur-lg animate-pulse opacity-70",
                            isRecordsTab && "bg-gradient-to-br from-green-300/40 to-green-500/40",
                            isPatientsTab && "bg-gradient-to-br from-blue-300/40 to-blue-500/40"
                          )} />
                          <div className={cn(
                            "absolute -inset-1 rounded-full blur-md animate-pulse opacity-50",
                            isRecordsTab && "bg-gradient-to-br from-green-400/30 to-green-600/30",
                            isPatientsTab && "bg-gradient-to-br from-blue-400/30 to-blue-600/30"
                          )} />
                        </>
                      )}
                      
                      {/* 新消息提示小红点 - 患者页签专用 */}
                      {isPatientsTab && !isActive && (
                        <div className={cn(
                          "absolute bg-gradient-to-r from-red-500 to-red-600 rounded-full border-2 border-white shadow-lg",
                          "animate-pulse",
                          deviceType === "mobile" ? "w-3.5 h-3.5 -top-1 -right-1" : "w-3 h-3 -top-0.5 -right-0.5"
                        )}>
                          <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-75" />
                        </div>
                      )}
                    </div>
                    
                    {/* 微信风格的文字标签 */}
                    <div className="mt-1.5 flex flex-col items-center">
                      <span
                        className={cn(
                          "font-medium transition-all duration-300",
                          deviceType === "mobile" ? "text-xs" : "text-[10px]",
                          isActive ? [
                            "scale-105 font-semibold transform",
                            isRecordsTab && "text-green-600",
                            isPatientsTab && "text-blue-600",
                          ] : [
                            "text-gray-600",
                            isRecordsTab && "group-hover:text-green-500",
                            isPatientsTab && "group-hover:text-blue-500",
                          ]
                        )}
                      >
                        {item.label}
                      </span>
                      
                      {/* 激活状态的底部指示器 */}
                      {isActive && (
                        <div className={cn(
                          "rounded-full mt-1 animate-pulse",
                          deviceType === "mobile" ? "w-1.5 h-1.5" : "w-1 h-1",
                          isRecordsTab && "bg-green-500 shadow-lg shadow-green-300/50",
                          isPatientsTab && "bg-blue-500 shadow-lg shadow-blue-300/50"
                        )} />
                      )}
                    </div>
                  </div>
                ) : (
                  // 其他页签保持原有样式
                  <div
                    className={cn(
                      "relative transition-all duration-300 rounded-xl p-1.5",
                      isActive ? "bg-primary/10" : "group-hover:bg-gray-100/50",
                    )}
                  >
                    <Icon
                      className={cn(
                        "transition-all duration-300",
                        deviceType === "mobile" ? "h-6 w-6" : deviceType === "tablet" ? "h-5 w-5" : "h-5 w-5",
                        isActive ? "transform scale-110" : "group-hover:scale-105",
                      )}
                    />
                    {/* 常规页签的活跃状态指示器 */}
                    {isActive && (
                      <div className="absolute inset-0 bg-primary/5 rounded-lg animate-pulse"></div>
                    )}
                  </div>
                )}
                {/* 记录和患者页签的标签已在上面处理，其他页签显示标签 */}
                {!isRecordsTab && !isPatientsTab && (
                  <>
                    <span
                      className={cn(
                        "transition-all duration-300",
                        deviceType === "mobile" ? "text-xs" : deviceType === "tablet" ? "text-[11px]" : "text-[10px]",
                        isActive ? "font-semibold text-primary" : "font-medium group-hover:font-medium",
                      )}
                    >
                      {item.label}
                    </span>
                    {/* 常规页签的底部活跃指示器 */}
                    {isActive && (
                      <div className="w-1 h-1 bg-primary rounded-full absolute -bottom-0.5 animate-pulse"></div>
                    )}
                  </>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
