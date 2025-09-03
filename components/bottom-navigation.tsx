"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Calendar, Users, User, FileText } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

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

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/98 backdrop-blur-lg border-t border-gray-100/50 z-50 shadow-2xl">
      <div
        className={cn(
          "flex items-center justify-around px-2 transition-all duration-200",
          isMobile ? "h-20 pb-safe" : "h-16",
          "max-w-screen-lg mx-auto",
        )}
      >
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id || pathname === item.href
          const isRecordsTab = item.id === "records"

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl transition-all duration-300",
                "min-w-0 flex-1 relative transform active:scale-95",
                "group hover:bg-gray-50/80",
                isActive ? "text-primary" : "text-gray-600 hover:text-gray-800",
                isRecordsTab && "scale-110 mx-2",
              )}
            >
              <div className="relative flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "relative p-1.5 rounded-lg transition-all duration-300",
                    isActive ? "bg-primary/10" : "group-hover:bg-gray-100/50",
                    isRecordsTab && !isActive && "bg-blue-50 border border-blue-200",
                    isRecordsTab && isActive && "bg-blue-100 border-2 border-blue-300 shadow-lg",
                  )}
                >
                  <Icon
                    className={cn(
                      "transition-all duration-300",
                      isMobile ? "h-6 w-6" : "h-5 w-5",
                      isActive ? "transform scale-110" : "group-hover:scale-105",
                      isRecordsTab && "h-7 w-7 text-blue-600",
                    )}
                  />
                  {isActive && <div className="absolute inset-0 bg-primary/5 rounded-lg animate-pulse"></div>}
                  {isRecordsTab && <div className="absolute inset-0 bg-blue-400/20 rounded-lg animate-pulse"></div>}
                </div>
                <span
                  className={cn(
                    "text-xs transition-all duration-300",
                    isMobile ? "text-xs" : "text-[10px]",
                    isActive ? "font-semibold text-primary" : "font-medium group-hover:font-medium",
                    isRecordsTab && "font-bold text-blue-600 text-sm",
                  )}
                >
                  {item.label}
                </span>
                {isActive && <div className="w-1 h-1 bg-primary rounded-full absolute -bottom-0.5 animate-pulse"></div>}
                {isRecordsTab && !isActive && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full absolute -top-1 -right-1 animate-bounce"></div>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
