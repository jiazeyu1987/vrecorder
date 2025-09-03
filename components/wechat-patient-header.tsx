"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useDeviceType } from "@/hooks/use-wechat-responsive"
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus,
  Bell,
  Settings,
  MoreHorizontal
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface WechatPatientHeaderProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  onAddFamily: () => void
  onFilter: () => void
  showFilter?: boolean
  totalPatients?: number
  totalFamilies?: number
}

export function WechatPatientHeader({
  searchTerm,
  onSearchChange,
  onAddFamily,
  onFilter,
  showFilter = false,
  totalPatients = 0,
  totalFamilies = 0
}: WechatPatientHeaderProps) {
  const deviceType = useDeviceType()

  return (
    <div className={cn(
      "sticky top-0 z-40 bg-gradient-to-b from-blue-50/95 to-white/95 backdrop-blur-xl",
      "border-b border-blue-100/50 shadow-sm",
      deviceType === "mobile" ? "px-3 py-4" : deviceType === "tablet" ? "px-4 py-3" : "px-6 py-3"
    )}>
      {/* 顶部标题栏 */}
      <div className="flex items-center justify-between mb-4">
        {/* 左侧标题信息 */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-500/10 rounded-2xl">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className={cn(
              "font-bold text-gray-900",
              deviceType === "mobile" ? "text-xl" : deviceType === "tablet" ? "text-lg" : "text-base"
            )}>
              患者管理
            </h1>
            <p className={cn(
              "text-gray-600",
              deviceType === "mobile" ? "text-xs" : "text-[10px]"
            )}>
              {totalFamilies}个家庭 · {totalPatients}位患者
            </p>
          </div>
        </div>

        {/* 右侧功能按钮 */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "rounded-full bg-white/60 hover:bg-white/80 border border-white/30",
              "shadow-lg backdrop-blur-md transition-all duration-200",
              deviceType === "mobile" ? "h-9 w-9" : "h-8 w-8"
            )}
          >
            <Bell className={cn(
              "text-gray-600",
              deviceType === "mobile" ? "h-4 w-4" : "h-3.5 w-3.5"
            )} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "rounded-full bg-white/60 hover:bg-white/80 border border-white/30",
              "shadow-lg backdrop-blur-md transition-all duration-200",
              deviceType === "mobile" ? "h-9 w-9" : "h-8 w-8"
            )}
          >
            <MoreHorizontal className={cn(
              "text-gray-600",
              deviceType === "mobile" ? "h-4 w-4" : "h-3.5 w-3.5"
            )} />
          </Button>
        </div>
      </div>

      {/* 搜索和操作栏 */}
      <div className="flex gap-3">
        {/* 搜索框 */}
        <div className="relative flex-1">
          <Search className={cn(
            "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400",
            deviceType === "mobile" ? "h-4 w-4" : "h-3.5 w-3.5"
          )} />
          <Input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="搜索患者或家庭"
            className={cn(
              "bg-white/90 backdrop-blur-md border border-white/30 rounded-2xl shadow-lg",
              "focus:bg-white focus:shadow-xl transition-all duration-200",
              "focus:border-blue-200 focus:ring-4 focus:ring-blue-100/50",
              "placeholder:text-gray-400",
              deviceType === "mobile" ? "pl-10 pr-4 py-3 text-sm h-11" : "pl-9 pr-3 py-2.5 text-xs h-9"
            )}
          />
        </div>
        
        {/* 筛选按钮 */}
        <Button
          variant="outline"
          size="sm"
          onClick={onFilter}
          className={cn(
            "bg-white/90 hover:bg-white border-white/30 text-gray-700 rounded-2xl shadow-lg",
            "backdrop-blur-md active:scale-95 transition-all duration-200",
            "hover:shadow-xl focus:ring-4 focus:ring-blue-100/50",
            showFilter && "bg-blue-50 border-blue-200 text-blue-700",
            deviceType === "mobile" ? "px-4 py-3 h-11" : "px-3 py-2.5 h-9"
          )}
        >
          <Filter className={cn(
            deviceType === "mobile" ? "h-4 w-4" : "h-3.5 w-3.5"
          )} />
        </Button>
        
        {/* 新增家庭按钮 */}
        <Button
          variant="outline"
          size="sm"
          onClick={onAddFamily}
          className={cn(
            "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
            "text-white border-0 rounded-2xl shadow-lg backdrop-blur-md",
            "active:scale-95 transition-all duration-200 hover:shadow-xl",
            "focus:ring-4 focus:ring-blue-200/50",
            deviceType === "mobile" ? "px-4 py-3 gap-2 h-11" : "px-3 py-2.5 gap-1.5 h-9"
          )}
        >
          <UserPlus className={cn(
            deviceType === "mobile" ? "h-4 w-4" : "h-3.5 w-3.5"
          )} />
          <span className={cn(
            "font-medium",
            deviceType === "mobile" ? "text-sm" : "text-xs"
          )}>
            新家庭
          </span>
        </Button>
      </div>

      {/* 筛选选项面板 */}
      {showFilter && (
        <div className={cn(
          "mt-3 p-3 bg-white/95 backdrop-blur-xl rounded-2xl border border-blue-100/50",
          "shadow-lg animate-in slide-in-from-top-2 duration-200"
        )}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn(
              "text-gray-600 font-medium",
              deviceType === "mobile" ? "text-xs" : "text-[10px]"
            )}>
              快速筛选:
            </span>
            
            {/* 筛选标签 */}
            {[
              { label: "全部", value: "all", color: "bg-gray-100 text-gray-700" },
              { label: "欠费", value: "overdue", color: "bg-orange-100 text-orange-700" },
              { label: "VIP", value: "vip", color: "bg-purple-100 text-purple-700" },
              { label: "近期服务", value: "recent", color: "bg-green-100 text-green-700" },
            ].map((filter) => (
              <Button
                key={filter.value}
                variant="ghost"
                size="sm"
                className={cn(
                  "rounded-xl transition-all duration-200 active:scale-95",
                  filter.color,
                  "hover:shadow-md border border-current/20",
                  deviceType === "mobile" ? "px-3 py-1.5 text-xs h-auto" : "px-2 py-1 text-[10px] h-auto"
                )}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}