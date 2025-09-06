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
    if (familyId === "none") {
      onFamilySelect("none", null)
    } else {
      const selectedFamily = families.find(f => f.id === familyId) || null
      onFamilySelect(familyId, selectedFamily)
    }
  }

  const getSelectedFamilyInfo = () => {
    if (!selectedFamilyId || selectedFamilyId === "none") return null
    return families.find(f => f.id === selectedFamilyId) || null
  }

  const selectedFamily = getSelectedFamilyInfo()

  return (
    <Card className={cn(
      "border border-green-700 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md",
      "bg-green-800",
      deviceType === "mobile" ? "rounded-2xl" : "rounded-xl",
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
              "rounded-full bg-green-600 text-white shadow-sm",
              "flex items-center justify-center transition-transform duration-300 hover:scale-105",
              deviceType === "mobile" ? "w-10 h-10" : "w-8 h-8"
            )}>
              <Home className={deviceType === "mobile" ? "h-5 w-5" : "h-4 w-4"} />
            </div>
            <h3 className={cn(
              "font-semibold text-white",
              deviceType === "mobile" ? "text-lg" : "text-base"
            )}>
              选择家庭
            </h3>
          </div>
        </div>

        {/* 家庭选择下拉框 */}
        <div className="space-y-2">
          <Select value={selectedFamilyId || ""} onValueChange={handleFamilySelect} disabled={isLoading}>
            <SelectTrigger className={cn(
              "w-full bg-green-700 border border-green-600 hover:border-green-500 focus:ring-green-400/30 focus:border-green-400 text-white",
              "transition-all duration-200 shadow-sm",
              deviceType === "mobile" ? "h-12 text-base" : "h-10 text-sm"
            )}>
              <SelectValue placeholder={isLoading ? "加载中..." : "请选择家庭"} />
            </SelectTrigger>
            <SelectContent className="max-h-60 bg-green-800 border-green-700">
              {/* 无选项 */}
              <SelectItem value="none">
                <div className="flex items-center gap-3 w-full">
                  <div className="flex-1">
                    <div className="font-medium text-white">无</div>
                    <div className="text-sm text-green-100">不选择任何家庭，显示所有记录</div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full border border-green-200">
                    <span>-</span>
                  </div>
                </div>
              </SelectItem>
              
              {families.map((family) => (
                <SelectItem key={family.id} value={family.id}>
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex-1">
                      <div className="font-medium text-white">{family.householdHead}</div>
                      <div className="text-sm text-green-100 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {family.address}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-green-800 bg-green-100 px-2 py-1 rounded-full border border-green-300">
                      <Users className="h-3 w-3" />
                      {family.totalMembers || 0}人
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {error && (
            <p className="text-sm text-red-300 flex items-center gap-1">
              <span className="text-red-400">⚠</span>
              {error}
            </p>
          )}
        </div>

        {/* 选中家庭的详细信息 */}
        {selectedFamily && (
          <div className={cn(
            "rounded-xl bg-green-700 border border-green-600 transition-all duration-300 hover:bg-green-600",
            "shadow-sm",
            deviceType === "mobile" ? "p-4" : "p-3"
          )}>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-white" />
                <span className={cn(
                  "font-medium text-white",
                  deviceType === "mobile" ? "text-base" : "text-sm"
                )}>
                  户主: {selectedFamily.householdHead}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-white" />
                <span className={cn(
                  "text-green-100 flex-1",
                  deviceType === "mobile" ? "text-sm" : "text-xs"
                )}>
                  {selectedFamily.address}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">电</span>
                </div>
                <span className={cn(
                  "text-green-100",
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