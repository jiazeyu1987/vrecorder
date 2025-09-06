"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Home, Users, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDeviceType } from "@/hooks/use-wechat-responsive"

interface Family {
  id: number
  householdHead: string
  address: string
  phone: string
  emergency_contact?: string
  emergency_phone?: string
  patient_count?: number
  created_at: string
}

interface FamilySelectorProps {
  selectedFamilyId?: string
  onFamilySelect: (familyId: string, family: Family | null) => void
  className?: string
}

export function FamilySelector({ selectedFamilyId, onFamilySelect, className }: FamilySelectorProps) {
  const deviceType = useDeviceType()
  const [families, setFamilies] = useState<Family[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 获取家庭列表
  const fetchFamilies = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('access_token')
      
      if (!token) {
        throw new Error('未找到访问令牌')
      }

      const response = await fetch('/api/v1/families', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '获取家庭列表失败')
      }

      const data = await response.json()
      if (data.code === 200) {
        setFamilies(data.data || [])
      } else {
        throw new Error(data.message || '获取家庭列表失败')
      }
    } catch (err) {
      console.error('获取家庭列表失败:', err)
      setError(err instanceof Error ? err.message : '获取家庭列表失败')
      // 如果API失败，使用模拟数据
      setFamilies([
        {
          id: 1,
          householdHead: "陈建国",
          address: "海淀区AA路AA号",
          phone: "13800138001",
          emergency_contact: "陈明",
          emergency_phone: "13800138002",
          patient_count: 2,
          created_at: "2024-01-15"
        },
        {
          id: 2,
          householdHead: "张明",
          address: "朝阳区XX路XX号", 
          phone: "13800138003",
          emergency_contact: "张华",
          emergency_phone: "13800138004",
          patient_count: 1,
          created_at: "2024-01-20"
        },
        {
          id: 3,
          householdHead: "李华",
          address: "朝阳区YY路YY号",
          phone: "13800138005",
          emergency_contact: "李明",
          emergency_phone: "13800138006", 
          patient_count: 1,
          created_at: "2024-01-25"
        },
        {
          id: 4,
          householdHead: "王秀英",
          address: "西城区BB路BB号",
          phone: "13800138007",
          emergency_contact: "王强",
          emergency_phone: "13800138008",
          patient_count: 1,
          created_at: "2024-01-30"
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFamilies()
  }, [])

  const handleFamilySelect = (familyId: string) => {
    const selectedFamily = families.find(f => f.id.toString() === familyId) || null
    onFamilySelect(familyId, selectedFamily)
  }

  const getSelectedFamilyInfo = () => {
    if (!selectedFamilyId) return null
    return families.find(f => f.id.toString() === selectedFamilyId) || null
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
                <SelectItem key={family.id} value={family.id.toString()}>
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
                      {family.patient_count || 0}人
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {error && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <span className="text-red-500">⚠</span>
              {error}（已切换到模拟数据）
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
              {selectedFamily.emergency_contact && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-red-600 text-xs font-bold">紧</span>
                  </div>
                  <span className={cn(
                    "text-red-700",
                    deviceType === "mobile" ? "text-sm" : "text-xs"
                  )}>
                    紧急联系人: {selectedFamily.emergency_contact}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}