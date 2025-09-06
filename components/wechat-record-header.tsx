"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Filter,
  Search,
  MoreHorizontal,
  ArrowLeft,
  Plus
} from "lucide-react"
import { useDeviceType, useWechatSubmenuConfig } from "@/hooks/use-wechat-responsive"
import { cn } from "@/lib/utils"


interface WechatRecordHeaderProps {
  title?: string
  subtitle?: string
  showBack?: boolean
  onBack?: () => void
  showSearch?: boolean
  onSearch?: () => void
  showFilter?: boolean
  onFilter?: () => void
  showAdd?: boolean
  onAdd?: () => void
}

export function WechatRecordHeader({
  title = "患者记录",
  subtitle = "记录和管理患者健康信息",
  showBack = false,
  onBack,
  showSearch = true,
  onSearch,
  showFilter = true,
  onFilter,
  showAdd = true,
  onAdd,
}: WechatRecordHeaderProps) {
  const deviceType = useDeviceType()
  const wechatConfig = useWechatSubmenuConfig()
  const [showTabs, setShowTabs] = useState(false)


  return (
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-100/50">
      {/* 主标题栏 */}
      <div 
        className={cn(
          "flex items-center justify-between",
          deviceType === "mobile" ? "px-4 py-3" : deviceType === "tablet" ? "px-5 py-3.5" : "px-6 py-4",
          "max-w-4xl mx-auto"
        )}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {showBack && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="p-2 rounded-full hover:bg-gray-100 shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="min-w-0 flex-1">
            <h1 className={cn(
              "font-semibold text-gray-800 truncate",
              deviceType === "mobile" ? "text-lg" : "text-xl"
            )}>
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {/* 操作按钮组 - 隐藏 */}
        <div className="flex items-center gap-2 shrink-0 hidden">
          {showSearch && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSearch}
              className={cn(
                "rounded-full hover:bg-gray-100",
                deviceType === "mobile" ? "p-2" : "p-2"
              )}
            >
              <Search className="h-4 w-4" />
            </Button>
          )}
          
          {showFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onFilter}
              className={cn(
                "rounded-full hover:bg-gray-100",
                deviceType === "mobile" ? "p-2" : "p-2"
              )}
            >
              <Filter className="h-4 w-4" />
            </Button>
          )}

          {showAdd && (
            <Button
              size="sm"
              onClick={onAdd}
              className={cn(
                "bg-gradient-to-r from-green-400 to-green-500 text-white",
                "shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/40",
                "rounded-full border-2 border-white/30",
                deviceType === "mobile" ? "px-3 py-2" : "px-4 py-2"
              )}
            >
              <Plus className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">新建</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTabs(!showTabs)}
            className={cn(
              "rounded-full hover:bg-gray-100",
              deviceType === "mobile" ? "p-2" : "p-2"
            )}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>


      {/* 扩展工具栏（可选显示） */}
      {showTabs && (
        <div className={cn(
          "border-t border-gray-100/50 bg-gray-50/30",
          deviceType === "mobile" ? "px-4 py-3" : deviceType === "tablet" ? "px-5 py-3" : "px-6 py-3",
          "animate-in slide-in-from-top-2 duration-200"
        )}>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              记录管理工具
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs"
              >
                批量操作
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs"
              >
                导出记录
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}