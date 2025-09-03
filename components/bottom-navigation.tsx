"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Calendar, Users, FileText, User } from "lucide-react"

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
    id: "patients",
    label: "患者",
    icon: Users,
    href: "/patients",
  },
  {
    id: "records",
    label: "记录",
    icon: FileText,
    href: "/records",
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

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id || pathname === item.href

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg transition-colors",
                "min-w-0 flex-1",
                isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
