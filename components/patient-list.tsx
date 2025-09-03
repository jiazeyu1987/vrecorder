"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Search,
  Users,
  MapPin,
  Calendar,
  CreditCard,
  Phone,
  AlertTriangle,
  User,
  Heart,
  Pill,
  ChevronRight,
  Plus,
  X,
} from "lucide-react"

interface FamilyMember {
  id: string
  name: string
  age: number
  gender: string
  relationship: string
  conditions: string[]
  lastService: string
  packageType: string
  paymentStatus: "normal" | "overdue" | "suspended"
  medications?: string[]
}

interface Family {
  id: string
  householdHead: string
  address: string
  phone: string
  members: FamilyMember[]
  totalMembers: number
  lastService: string
}

const mockFamilies: Family[] = [
  {
    id: "1",
    householdHead: "张伟",
    address: "朝阳区幸福小区3号楼502",
    phone: "138****1234",
    members: [
      {
        id: "1-1",
        name: "张伟",
        age: 65,
        gender: "男",
        relationship: "户主",
        conditions: ["高血压"],
        lastService: "2024-03-10",
        packageType: "标准套餐",
        paymentStatus: "normal",
        medications: ["降压药"],
      },
      {
        id: "1-2",
        name: "李梅",
        age: 62,
        gender: "女",
        relationship: "配偶",
        conditions: ["糖尿病"],
        lastService: "2024-03-12",
        packageType: "VIP套餐",
        paymentStatus: "normal",
        medications: ["胰岛素"],
      },
    ],
    totalMembers: 2,
    lastService: "2024-03-12",
  },
  {
    id: "2",
    householdHead: "王小明",
    address: "朝阳区阳光花园1号楼301",
    phone: "139****5678",
    members: [
      {
        id: "2-1",
        name: "王小明",
        age: 35,
        gender: "男",
        relationship: "户主",
        conditions: ["健康体检"],
        lastService: "2024-03-05",
        packageType: "基础套餐",
        paymentStatus: "overdue",
      },
    ],
    totalMembers: 1,
    lastService: "2024-03-05",
  },
  {
    id: "3",
    householdHead: "陈奶奶",
    address: "海淀区康乐小区5号楼201",
    phone: "136****9012",
    members: [
      {
        id: "3-1",
        name: "陈秀英",
        age: 78,
        gender: "女",
        relationship: "户主",
        conditions: ["高血压", "糖尿病"],
        lastService: "2024-03-14",
        packageType: "VIP套餐",
        paymentStatus: "normal",
        medications: ["降压药", "降糖药"],
      },
    ],
    totalMembers: 1,
    lastService: "2024-03-14",
  },
]

export function PatientList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null)
  const [showNewFamilyModal, setShowNewFamilyModal] = useState(false)
  const isMobile = useIsMobile()
  const [newFamily, setNewFamily] = useState({
    householdHead: "",
    address: "",
    phone: "",
    members: [
      {
        name: "",
        age: "",
        gender: "",
        relationship: "户主",
        conditions: "",
        packageType: "基础套餐",
      },
    ],
  })

  const addFamilyMember = () => {
    setNewFamily((prev) => ({
      ...prev,
      members: [
        ...prev.members,
        {
          name: "",
          age: "",
          gender: "",
          relationship: "",
          conditions: "",
          packageType: "基础套餐",
        },
      ],
    }))
  }

  const removeFamilyMember = (index: number) => {
    if (newFamily.members.length > 1) {
      setNewFamily((prev) => ({
        ...prev,
        members: prev.members.filter((_, i) => i !== index),
      }))
    }
  }

  const updateFamilyMember = (index: number, field: string, value: string) => {
    setNewFamily((prev) => ({
      ...prev,
      members: prev.members.map((member, i) => (i === index ? { ...member, [field]: value } : member)),
    }))
  }

  const handleSubmitNewFamily = () => {
    console.log("[v0] Submitting new family:", newFamily)
    setShowNewFamilyModal(false)
    setNewFamily({
      householdHead: "",
      address: "",
      phone: "",
      members: [
        {
          name: "",
          age: "",
          gender: "",
          relationship: "户主",
          conditions: "",
          packageType: "基础套餐",
        },
      ],
    })
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "bg-green-100 text-green-700 border-green-200"
      case "overdue":
        return "bg-orange-100 text-orange-700 border-orange-200"
      case "suspended":
        return "bg-gray-100 text-gray-700 border-gray-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case "normal":
        return "正常"
      case "overdue":
        return "欠费"
      case "suspended":
        return "暂停"
      default:
        return "未知"
    }
  }

  if (selectedFamily) {
    return (
      <div className={`space-y-4 ${isMobile ? 'px-4 py-4' : 'px-6 py-6 max-w-2xl mx-auto'}`}>
        <div className="flex items-center gap-3 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSelectedFamily(null)} 
            className="p-2 rounded-full hover:bg-gray-100"
          >
            ←
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">{selectedFamily.householdHead}家</h1>
            <p className="text-sm text-gray-600">家庭档案管理</p>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              家庭信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{selectedFamily.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{selectedFamily.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">最近服务: {selectedFamily.lastService}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">家庭成员 ({selectedFamily.totalMembers}人)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedFamily.members.map((member) => (
              <div key={member.id} className="p-3 bg-muted/50 rounded-lg border space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="font-medium">{member.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">({member.relationship})</span>
                    </div>
                  </div>
                  <Badge variant="outline" className={getPaymentStatusColor(member.paymentStatus)}>
                    {getPaymentStatusText(member.paymentStatus)}
                  </Badge>
                </div>

                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    {member.age}岁 | {member.gender}
                  </p>
                  <div className="flex items-center gap-2">
                    <Heart className="h-3 w-3" />
                    <span>{member.conditions.join(", ")}</span>
                  </div>
                  {member.medications && (
                    <div className="flex items-center gap-2">
                      <Pill className="h-3 w-3" />
                      <span>{member.medications.join(", ")}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>最近服务: {member.lastService}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-3 w-3" />
                    <span>{member.packageType}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    查看详情
                  </Button>
                  {member.paymentStatus === "overdue" && (
                    <Button size="sm" variant="outline" className="text-orange-600 border-orange-300 bg-transparent">
                      催缴
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">家庭操作</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <CreditCard className="h-4 w-4 mr-2" />
              查看家庭付款记录
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Calendar className="h-4 w-4 mr-2" />
              为全家人安排服务
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Phone className="h-4 w-4 mr-2" />
              联系家庭主要联系人
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${isMobile ? 'px-4 py-4' : 'px-6 py-6 max-w-2xl mx-auto'}`}>
      <div className="space-y-4">
        <div className="text-center py-2">
          <h1 className="text-2xl font-semibold text-gray-800">患者管理</h1>
          <p className="text-sm text-gray-600 mt-1">管理患者家庭档案</p>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="搜索患者姓名或地址..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 py-3 rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-none"
          />
        </div>
      </div>

      <Card className="shadow-none border-0 bg-white/80 backdrop-blur-sm rounded-2xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-600">12</div>
              <div className="text-xs text-blue-700 mt-1">总家庭</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-600">18</div>
              <div className="text-xs text-green-700 mt-1">总患者</div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-4">
              <div className="text-2xl font-bold text-amber-600">2</div>
              <div className="text-xs text-amber-700 mt-1">欠费家庭</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {mockFamilies.map((family) => (
          <Card
            key={family.id}
            className="shadow-none border-0 bg-white/80 backdrop-blur-sm rounded-2xl cursor-pointer hover:bg-white/90 transition-all duration-200 hover:scale-[1.02]"
            onClick={() => setSelectedFamily(family)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-medium">{family.householdHead}家</span>
                  <Badge variant="secondary" className="text-xs">
                    {family.totalMembers}人
                  </Badge>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{family.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>最近服务: {family.lastService}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <div className="flex gap-1">
                  {family.members.map((member) => (
                    <Badge
                      key={member.id}
                      variant="outline"
                      className={`text-xs ${getPaymentStatusColor(member.paymentStatus)}`}
                    >
                      {member.name}
                    </Badge>
                  ))}
                </div>
                {family.members.some((m) => m.paymentStatus === "overdue") && (
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showNewFamilyModal} onOpenChange={setShowNewFamilyModal}>
        <DialogTrigger asChild>
          <Button className="w-full bg-primary/90 hover:bg-primary rounded-2xl py-4 font-medium shadow-lg" variant="default">
            <Users className="h-5 w-5 mr-2" />
            添加新患者家庭
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>添加新患者家庭</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="householdHead">户主姓名</Label>
              <Input
                id="householdHead"
                value={newFamily.householdHead}
                onChange={(e) => setNewFamily((prev) => ({ ...prev, householdHead: e.target.value }))}
                placeholder="请输入户主姓名"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">家庭地址</Label>
              <Textarea
                id="address"
                value={newFamily.address}
                onChange={(e) => setNewFamily((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="请输入详细地址"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">联系电话</Label>
              <Input
                id="phone"
                value={newFamily.phone}
                onChange={(e) => setNewFamily((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="请输入联系电话"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>家庭成员</Label>
                <Button type="button" variant="outline" size="sm" onClick={addFamilyMember}>
                  <Plus className="h-3 w-3 mr-1" />
                  添加成员
                </Button>
              </div>

              {newFamily.members.map((member, index) => (
                <Card key={index} className="p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">成员 {index + 1}</span>
                    {newFamily.members.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeFamilyMember(index)}>
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">姓名</Label>
                      <Input
                        value={member.name}
                        onChange={(e) => updateFamilyMember(index, "name", e.target.value)}
                        placeholder="姓名"
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">年龄</Label>
                      <Input
                        value={member.age}
                        onChange={(e) => updateFamilyMember(index, "age", e.target.value)}
                        placeholder="年龄"
                        type="number"
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">性别</Label>
                      <Select
                        value={member.gender}
                        onValueChange={(value) => updateFamilyMember(index, "gender", value)}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="选择性别" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="男">男</SelectItem>
                          <SelectItem value="女">女</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">关系</Label>
                      <Select
                        value={member.relationship}
                        onValueChange={(value) => updateFamilyMember(index, "relationship", value)}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="选择关系" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="户主">户主</SelectItem>
                          <SelectItem value="配偶">配偶</SelectItem>
                          <SelectItem value="子女">子女</SelectItem>
                          <SelectItem value="父母">父母</SelectItem>
                          <SelectItem value="其他">其他</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">健康状况</Label>
                    <Input
                      value={member.conditions}
                      onChange={(e) => updateFamilyMember(index, "conditions", e.target.value)}
                      placeholder="如：高血压、糖尿病等"
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">套餐类型</Label>
                    <Select
                      value={member.packageType}
                      onValueChange={(value) => updateFamilyMember(index, "packageType", value)}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="基础套餐">基础套餐</SelectItem>
                        <SelectItem value="标准套餐">标准套餐</SelectItem>
                        <SelectItem value="VIP套餐">VIP套餐</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowNewFamilyModal(false)}>
                取消
              </Button>
              <Button className="flex-1" onClick={handleSubmitNewFamily}>
                保存
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
