"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

interface WechatPageHeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  onBack?: () => void
  rightActions?: React.ReactNode
}

export function WechatPageHeader({ 
  title, 
  subtitle, 
  showBack = false, 
  onBack, 
  rightActions 
}: WechatPageHeaderProps) {
  const isMobile = useIsMobile()

  return (
    <div className={`sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-100/50 ${isMobile ? 'px-4 py-3' : 'px-6 py-4'}`}>
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          {showBack && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className={`font-semibold text-gray-800 ${isMobile ? 'text-lg' : 'text-xl'}`}>
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        {rightActions && (
          <div className="flex items-center gap-2">
            {rightActions}
          </div>
        )}
      </div>
    </div>
  )
}