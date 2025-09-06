"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Home, Users, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDeviceType } from "@/hooks/use-wechat-responsive"
import { getFamilies, withErrorHandling, type Family } from "@/lib/api"

interface FamilySelectorProps {
  selectedFamilyId?: string
  onFamilySelect: (familyId: string, family: Family | null) => void
  className?: string
  autoSelectId?: string // 自动选择的家庭ID
  autoSelectName?: string // 自动选择的家庭名称
}

export function FamilySelector({ selectedFamilyId, onFamilySelect, className, autoSelectId, autoSelectName }: FamilySelectorProps) {
  const deviceType = useDeviceType()
  const [families, setFamilies] = useState<Family[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  console.log("[FamilySelector] Props:", {
    selectedFamilyId, autoSelectId, autoSelectName, familiesCount: families.length
  })

  // 获取家庭列表
  const fetchFamilies = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await withErrorHandling(() => getFamilies(1, 100, ''))
      
      if (response.code === 200) {
        setFamilies(response.data.families)
      } else {
        throw new Error(response.message || '获取家庭列表失败')
      }
    } catch (err) {
      console.error('获取家庭列表失败:', err)
      setError(err instanceof Error ? err.message : '获取家庭列表失败')
      // 保留空数组，不再使用模拟数据
      setFamilies([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFamilies()
  }, [])

  // 在家庭数据加载完成后，如果有autoSelectId，自动选择对应的家庭
  useEffect(() => {
    console.log("[FamilySelector] 自动选择检查:", {
      autoSelectId,
      autoSelectName,
      familiesCount: families.length,
      selectedFamilyId,
      familyIds: families.map(f => f.id),
      familyDetails: families.map(f => ({id: f.id, name: f.householdHead}))
    })
    
    if ((autoSelectId || autoSelectName) && families.length > 0 && !selectedFamilyId) {
      let foundFamily = null
      
      // 优先使用名称匹配
      if (autoSelectName) {
        foundFamily = families.find(f => f.householdHead === autoSelectName)
        console.log("[FamilySelector] 名称匹配结果:", { foundFamily, searchName: autoSelectName })
      }
      
      // 如果名称匹配失败，尝试ID匹配
      if (!foundFamily && autoSelectId) {
        foundFamily = families.find(f => f.id === autoSelectId)
        console.log("[FamilySelector] ID匹配结果:", { foundFamily, searchId: autoSelectId })
        
        // 尝试数字类型匹配
        if (!foundFamily) {
          foundFamily = families.find(f => f.id.toString() === autoSelectId || f.id === parseInt(autoSelectId))
          console.log("[FamilySelector] 数字匹配结果:", { foundFamily, searchId: autoSelectId })
        }
      }
      
      if (foundFamily) {
        console.log("[FamilySelector] 自动选择家庭:", foundFamily)
        onFamilySelect(foundFamily.id, foundFamily)
      } else {
        // 如果都没找到，选择第一个家庭作为默认选项
        console.log("[FamilySelector] 所有匹配都失败，选择第一个家庭作为默认")
        const firstFamily = families[0]
        if (firstFamily) {
          console.log("[FamilySelector] 选择默认家庭:", firstFamily)
          onFamilySelect(firstFamily.id, firstFamily)
        }
      }
    }
  }, [autoSelectId, autoSelectName, families, selectedFamilyId, onFamilySelect])

  const handleFamilySelect = (familyId: string) => {
    const selectedFamily = families.find(f => f.id === familyId) || null
    onFamilySelect(familyId, selectedFamily)
  }

  const getSelectedFamilyInfo = () => {
    if (!selectedFamilyId) return null
    return families.find(f => f.id === selectedFamilyId) || null
  }

  const selectedFamily = getSelectedFamilyInfo()

  return (
    <Card className={cn(
      "border-4 border-red-500 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl",
      "bg-gradient-to-br from-red-50/80 via-white to-red-50/50 backdrop-blur-sm",
      "ring-4 ring-red-300/50",
      "animate-pulse hover:animate-none",
      deviceType === "mobile" ? "rounded-3xl" : "rounded-2xl",
      className
    )}>
      <CardContent className={cn(
        "space-y-4",
        deviceType === "mobile" ? "p-6" : "p-5"
      )}>
        {/* 标题 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg",
              "flex items-center justify-center transition-transform duration-300 hover:scale-110",
              "ring-2 ring-red-300/50 animate-bounce",
              deviceType === "mobile" ? "w-10 h-10" : "w-8 h-8"
            )}>
              <Home className={deviceType === "mobile" ? "h-5 w-5" : "h-4 w-4"} />
            </div>
            <h3 className={cn(
              "font-bold text-red-700",
              deviceType === "mobile" ? "text-xl" : "text-lg"
            )}>
              🏠 选择家庭
            </h3>
          </div>
          <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
            新功能
          </div>
        </div>

        {/* 家庭选择下拉框 */}
        <div className="space-y-2">
          <Select value={selectedFamilyId || ""} onValueChange={handleFamilySelect} disabled={isLoading}>
            <SelectTrigger className={cn(
              "w-full bg-white/90 border-2 border-red-400 hover:bg-white focus:ring-red-500/30 focus:border-red-500",
              "transition-all duration-200 shadow-md",
              deviceType === "mobile" ? "h-12 text-base" : "h-10 text-sm"
            )}>
              <SelectValue placeholder={isLoading ? "加载中..." : "请选择家庭"} />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {families.map((family) => (
                <SelectItem key={family.id} value={family.id}>
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{family.householdHead}</div>
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {family.address}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-200">
                      <Users className="h-3 w-3" />
                      {family.totalMembers || 0}人
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {error && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <span className="text-red-500">⚠</span>
              {error}
            </p>
          )}
        </div>

        {/* 选中家庭的详细信息 */}
        {selectedFamily && (
          <div className={cn(
            "rounded-2xl bg-white/80 backdrop-blur-sm border-2 border-red-300 transition-all duration-300 hover:bg-white/90",
            "shadow-md ring-2 ring-red-200/30",
            deviceType === "mobile" ? "p-4" : "p-3"
          )}>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-red-600" />
                <span className={cn(
                  "font-medium text-red-800",
                  deviceType === "mobile" ? "text-base" : "text-sm"
                )}>
                  户主: {selectedFamily.householdHead}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-red-600" />
                <span className={cn(
                  "text-red-700 flex-1",
                  deviceType === "mobile" ? "text-sm" : "text-xs"
                )}>
                  {selectedFamily.address}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 text-xs font-bold">电</span>
                </div>
                <span className={cn(
                  "text-red-700",
                  deviceType === "mobile" ? "text-sm" : "text-xs"
                )}>
                  联系电话: {selectedFamily.phone}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}