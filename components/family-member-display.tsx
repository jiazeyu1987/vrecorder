"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDeviceType } from "@/hooks/use-wechat-responsive"
import { cn } from "@/lib/utils"
import {
  Users,
  User,
  Heart,
  Pill,
  Phone,
  MapPin,
} from "lucide-react"

export interface FamilyMemberData {
  id: number
  name: string
  age: number
  gender: string
  relationship: string
  phone?: string
  health_conditions: string[]
  medications: string[]
  paymentStatus?: "normal" | "overdue" | "suspended"
}

export interface FamilyData {
  id: number
  household_head: string
  address: string
  phone: string
  members: FamilyMemberData[]
}

interface FamilyMemberDisplayProps {
  family: FamilyData
  className?: string
}

const getPaymentStatusColor = (status: string = "normal") => {
  switch (status) {
    case "overdue":
      return "bg-orange-100/70 text-orange-700 border-orange-200/40"
    case "suspended":
      return "bg-red-100/70 text-red-700 border-red-200/40"
    default:
      return "bg-green-100/70 text-green-700 border-green-200/40"
  }
}

const getPaymentStatusText = (status: string = "normal") => {
  switch (status) {
    case "overdue":
      return "待缴费"
    case "suspended":
      return "已停用"
    default:
      return "正常"
  }
}

export function FamilyMemberDisplay({ family, className }: FamilyMemberDisplayProps) {
  const deviceType = useDeviceType()

  console.log("[FamilyMemberDisplay] 渲染家庭数据:", family)

  if (!family || !family.members) {
    return (
      <Card className={cn("border-gray-200/60 shadow-md", className)}>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">没有家庭成员数据</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* 当前服务信息 - 显示户主信息 */}
      <Card className="border-blue-200/60 bg-blue-50/30 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className={cn(
            "flex items-center gap-3 text-blue-900",
            deviceType === "mobile" ? "text-base" : "text-sm"
          )}>
            <div className="flex items-center justify-center w-8 h-8 bg-blue-500/10 rounded-full">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <span>当前服务信息</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-white/60 rounded-xl p-3 space-y-2 border border-blue-100/60">
            <div className="flex items-center justify-between">
              <span className={cn(
                "font-bold text-gray-900",
                deviceType === "mobile" ? "text-base" : "text-sm"
              )}>{family.household_head}</span>
              <Badge variant="outline" className="bg-blue-50/60 text-blue-700 border-blue-200/40 rounded-full text-xs px-2 py-0.5">
                户主
              </Badge>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-green-100/70 p-1 rounded-lg mt-0.5">
                <MapPin className="h-3 w-3 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="text-gray-600 font-medium text-xs">服务地址</p>
                <p className="text-gray-800 text-sm">{family.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-blue-100/70 p-1 rounded-lg mt-0.5">
                <Phone className="h-3 w-3 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-gray-600 font-medium text-xs">联系电话</p>
                <p className="text-gray-800 text-sm">{family.phone}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 家庭成员健康记录 */}
      <Card className="border-green-200/60 bg-green-50/30 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className={cn(
            "flex items-center gap-3 text-green-900",
            deviceType === "mobile" ? "text-base" : "text-sm"
          )}>
            <div className="flex items-center justify-center w-8 h-8 bg-green-500/10 rounded-full">
              <Users className="h-4 w-4 text-green-600" />
            </div>
            <span>家庭成员健康记录</span>
            <Badge variant="secondary" className="bg-green-100/70 text-green-700 border-green-200/40 rounded-full text-xs px-2 py-0.5">
              {family.members.length}人
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-3">
            {family.members.map((member) => (
              <div key={member.id} className={cn(
                "group bg-gray-50/80 rounded-2xl border border-gray-100/80 transition-all duration-200",
                "hover:bg-white hover:border-gray-200/90 hover:shadow-lg",
                "transform overflow-hidden",
                deviceType === "mobile" ? "p-4" : "p-3"
              )}>
                {/* 成员基本信息 */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500 p-2 rounded-xl group-hover:scale-105 transition-transform duration-200">
                      <User className={cn(
                        "text-white",
                        deviceType === "mobile" ? "h-4 w-4" : "h-3.5 w-3.5"
                      )} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "font-bold text-gray-900",
                          deviceType === "mobile" ? "text-base" : "text-sm"
                        )}>{member.name}</span>
                        <Badge variant="outline" className={cn(
                          "bg-blue-50/60 text-blue-700 border-blue-200/40 rounded-full",
                          deviceType === "mobile" ? "text-xs px-2 py-0.5" : "text-[10px] px-1.5 py-0.5"
                        )}>
                          {member.relationship}
                        </Badge>
                      </div>
                      <p className={cn(
                        "text-gray-600 font-medium",
                        deviceType === "mobile" ? "text-sm" : "text-xs"
                      )}>{member.age}岁 · {member.gender}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={cn(
                    getPaymentStatusColor(member.paymentStatus),
                    "rounded-full font-medium border-0 shadow-sm",
                    deviceType === "mobile" ? "text-xs px-2.5 py-1" : "text-[10px] px-2 py-0.5"
                  )}>
                    {getPaymentStatusText(member.paymentStatus)}
                  </Badge>
                </div>

                {/* 成员详细信息 */}
                <div className="bg-white/60 rounded-xl p-3 space-y-2 border border-gray-100/60">
                  {/* 健康状况 */}
                  <div className="flex items-start gap-2">
                    <div className="bg-red-100/70 p-1 rounded-lg mt-0.5">
                      <Heart className={cn(
                        "text-red-500",
                        deviceType === "mobile" ? "h-3 w-3" : "h-2.5 w-2.5"
                      )} />
                    </div>
                    <div className="flex-1">
                      <p className={cn(
                        "text-gray-600 font-medium mb-1",
                        deviceType === "mobile" ? "text-xs" : "text-[10px]"
                      )}>健康状况</p>
                      <div className="flex gap-1 flex-wrap">
                        {member.health_conditions && member.health_conditions.length > 0 ? (
                          member.health_conditions.map((condition, index) => (
                            <Badge key={index} 
                              variant="secondary" 
                              className={cn(
                                "bg-red-50/80 text-red-700 border border-red-200/60 rounded-lg",
                                deviceType === "mobile" ? "text-[10px] px-1.5 py-0.5" : "text-[9px] px-1 py-0.5"
                              )}
                            >
                              {condition}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-gray-500 text-xs">暂无记录</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 用药情况 */}
                  <div className="flex items-start gap-2">
                    <div className="bg-blue-100/70 p-1 rounded-lg mt-0.5">
                      <Pill className={cn(
                        "text-blue-500",
                        deviceType === "mobile" ? "h-3 w-3" : "h-2.5 w-2.5"
                      )} />
                    </div>
                    <div className="flex-1">
                      <p className={cn(
                        "text-gray-600 font-medium mb-1",
                        deviceType === "mobile" ? "text-xs" : "text-[10px]"
                      )}>用药情况</p>
                      <div className="flex gap-1 flex-wrap">
                        {member.medications && member.medications.length > 0 ? (
                          member.medications.map((medication, index) => (
                            <Badge key={index} 
                              variant="secondary" 
                              className={cn(
                                "bg-blue-50/80 text-blue-700 border border-blue-200/60 rounded-lg",
                                deviceType === "mobile" ? "text-[10px] px-1.5 py-0.5" : "text-[9px] px-1 py-0.5"
                              )}
                            >
                              {medication}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-gray-500 text-xs">暂无记录</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 联系电话 */}
                  {member.phone && (
                    <div className="flex items-start gap-2">
                      <div className="bg-green-100/70 p-1 rounded-lg mt-0.5">
                        <Phone className={cn(
                          "text-green-500",
                          deviceType === "mobile" ? "h-3 w-3" : "h-2.5 w-2.5"
                        )} />
                      </div>
                      <div className="flex-1">
                        <p className={cn(
                          "text-gray-600 font-medium mb-1",
                          deviceType === "mobile" ? "text-xs" : "text-[10px]"
                        )}>联系电话</p>
                        <p className="text-gray-800 text-sm">{member.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}