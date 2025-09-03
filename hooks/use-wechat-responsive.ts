"use client"

import * as React from "react"
import { useIsMobile, useIsTablet, useIsDesktop } from "./use-mobile"

export type DeviceType = "mobile" | "tablet" | "desktop"

export interface ResponsiveConfig {
  mobile: any
  tablet: any
  desktop: any
}

export function useDeviceType(): DeviceType {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const isDesktop = useIsDesktop()

  if (isMobile) return "mobile"
  if (isTablet) return "tablet"
  if (isDesktop) return "desktop"
  return "desktop" // fallback
}

export function useResponsiveValue<T>(config: ResponsiveConfig): T {
  const deviceType = useDeviceType()
  return config[deviceType] as T
}

/**
 * 获取微信小程序风格的子菜单配置
 */
export function useWechatSubmenuConfig() {
  const deviceType = useDeviceType()
  
  return React.useMemo(() => {
    const baseConfig = {
      // 共同样式
      backdropBlur: "backdrop-blur-xl",
      background: "bg-white/95",
      textColor: "text-gray-800",
      borderRadius: "rounded-2xl",
      shadow: "shadow-2xl shadow-black/10",
      border: "border-0",
      
      // 动画
      animations: {
        enter: "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
        exit: "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        slide: {
          bottom: "data-[side=bottom]:slide-in-from-top-2",
          top: "data-[side=top]:slide-in-from-bottom-2",
          left: "data-[side=left]:slide-in-from-right-2",
          right: "data-[side=right]:slide-in-from-left-2",
        }
      },
      
      // 间距和尺寸
      spacing: {
        content: deviceType === "mobile" ? "p-2" : "p-2",
        item: deviceType === "mobile" ? "px-6 py-4" : deviceType === "tablet" ? "px-5 py-3" : "px-4 py-3",
        gap: deviceType === "mobile" ? "gap-3" : "gap-3",
        sideOffset: deviceType === "mobile" ? 12 : 8,
      },
      
      // 字体大小
      text: {
        item: deviceType === "mobile" ? "text-base" : "text-sm",
        label: deviceType === "mobile" ? "text-sm" : "text-xs",
        title: deviceType === "mobile" ? "text-lg" : "text-base",
      },
      
      // 交互效果
      interactions: {
        hover: "hover:bg-gray-100/80",
        active: "active:bg-gray-200/60",
        focus: deviceType === "mobile" ? "focus:ring-4 focus:ring-primary/20" : "focus:ring-4 focus:ring-primary/20",
        transform: "transition-all duration-200 transform active:scale-95",
      },
      
      // 最小宽度
      minWidth: deviceType === "mobile" ? "min-w-[12rem]" : deviceType === "tablet" ? "min-w-[11rem]" : "min-w-[10rem]",
      
      // 触摸友好性
      touchFriendly: deviceType === "mobile" ? {
        minHeight: "min-h-[44px]", // iOS/Android推荐最小触摸区域
        padding: "p-4",
      } : {
        minHeight: "min-h-[32px]",
        padding: "p-3",
      }
    }
    
    return baseConfig
  }, [deviceType])
}

/**
 * 获取设备特定的CSS类名
 */
export function getDeviceSpecificClasses(
  mobileClasses: string,
  tabletClasses: string,
  desktopClasses: string
): string {
  return `${mobileClasses} md:${tabletClasses} lg:${desktopClasses}`
}

/**
 * 合并微信风格的基础样式类
 */
export function mergeWechatStyles(...classes: (string | undefined)[]): string {
  const baseStyles = "bg-white/95 backdrop-blur-xl text-gray-800 rounded-2xl border-0 shadow-2xl shadow-black/10"
  return [baseStyles, ...classes.filter(Boolean)].join(" ")
}

/**
 * 获取响应式的触摸区域大小
 */
export function getResponsiveTouchSize() {
  const deviceType = useDeviceType()
  
  return {
    mobile: "min-h-[48px] min-w-[48px]", // 48px是推荐的移动端最小触摸区域
    tablet: "min-h-[44px] min-w-[44px]",
    desktop: "min-h-[36px] min-w-[36px]",
  }[deviceType]
}

/**
 * 微信小程序风格的项目样式生成器
 */
export function generateWechatItemStyles(options: {
  variant?: "default" | "destructive"
  size?: "sm" | "md" | "lg"
  isActive?: boolean
} = {}) {
  const { variant = "default", size = "md", isActive = false } = options
  const deviceType = useDeviceType()
  
  const baseStyles = [
    "flex items-center gap-3 rounded-xl outline-hidden select-none",
    "transition-all duration-200 transform active:scale-95",
    "focus:ring-4 focus:ring-primary/20",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ]
  
  // 变体样式
  const variantStyles = {
    default: [
      "text-gray-800 hover:bg-gray-100/80 active:bg-gray-200/60",
      "[&_svg:not([class*='text-'])]:text-gray-500",
    ],
    destructive: [
      "text-red-600 hover:bg-red-50 active:bg-red-100",
      "[&_svg:not([class*='text-'])]:text-red-600",
    ],
  }
  
  // 尺寸样式
  const sizeStyles = {
    sm: deviceType === "mobile" ? "px-4 py-2 text-sm" : "px-3 py-2 text-xs",
    md: deviceType === "mobile" ? "px-6 py-4 text-base" : deviceType === "tablet" ? "px-5 py-3 text-sm" : "px-4 py-3 text-sm",
    lg: deviceType === "mobile" ? "px-8 py-5 text-lg" : deviceType === "tablet" ? "px-6 py-4 text-base" : "px-5 py-4 text-base",
  }
  
  // 活跃状态样式
  const activeStyles = isActive ? [
    "bg-gray-100/80 text-primary shadow-sm",
    "[&_svg:not([class*='text-'])]:text-primary",
  ] : []
  
  // 字体权重
  const fontWeight = "font-medium"
  
  // 图标尺寸
  const iconSize = "[&_svg:not([class*='size-'])]:size-4"
  
  return [
    ...baseStyles,
    ...variantStyles[variant],
    sizeStyles[size],
    ...activeStyles,
    fontWeight,
    iconSize,
  ].join(" ")
}

export default {
  useDeviceType,
  useResponsiveValue,
  useWechatSubmenuConfig,
  getDeviceSpecificClasses,
  mergeWechatStyles,
  getResponsiveTouchSize,
  generateWechatItemStyles,
}
