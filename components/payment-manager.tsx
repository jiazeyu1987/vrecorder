"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  CreditCard,
  Clock,
  AlertTriangle,
  RefreshCw,
  QrCode,
  Smartphone,
  Banknote,
  Building,
  ArrowLeft,
  Calendar,
  User,
  Package,
  Receipt,
} from "lucide-react"

interface Payment {
  id: string
  patientName: string
  patientId: string
  amount: number
  serviceType: string
  serviceDate: string
  status: "pending" | "paid" | "overdue" | "refunded" | "processing"
  paymentMethod?: "wechat" | "alipay" | "cash" | "bank"
  transactionId?: string
  createdAt: string
  dueDate: string
  packageType?: string
  notes?: string
}

interface RefundRequest {
  id: string
  originalPaymentId: string
  amount: number
  reason: string
  status: "pending" | "approved" | "rejected" | "completed"
  requestDate: string
}

const mockPayments: Payment[] = [
  {
    id: "1",
    patientName: "张明",
    patientId: "P001",
    amount: 280,
    serviceType: "基础健康监测",
    serviceDate: "2024-03-15",
    status: "pending",
    createdAt: "2024-03-15 09:00",
    dueDate: "2024-03-15 18:00",
    packageType: "标准套餐",
  },
  {
    id: "2",
    patientName: "李华",
    patientId: "P002",
    amount: 350,
    serviceType: "综合健康评估",
    serviceDate: "2024-03-15",
    status: "paid",
    paymentMethod: "wechat",
    transactionId: "WX20240315001",
    createdAt: "2024-03-15 14:30",
    dueDate: "2024-03-15 18:00",
    packageType: "VIP套餐",
  },
  {
    id: "3",
    patientName: "王小明",
    patientId: "P003",
    amount: 200,
    serviceType: "常规体检",
    serviceDate: "2024-03-10",
    status: "overdue",
    createdAt: "2024-03-10 16:00",
    dueDate: "2024-03-10 18:00",
    packageType: "基础套餐",
  },
]

export function PaymentManager() {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showRefundForm, setShowRefundForm] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<string>("")
  const [refundReason, setRefundReason] = useState("")
  const [refundAmount, setRefundAmount] = useState("")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700 border-green-200"
      case "pending":
        return "bg-orange-100 text-orange-700 border-orange-200"
      case "overdue":
        return "bg-red-100 text-red-700 border-red-200"
      case "refunded":
        return "bg-gray-100 text-gray-700 border-gray-200"
      case "processing":
        return "bg-blue-100 text-blue-700 border-blue-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "已收款"
      case "pending":
        return "待收款"
      case "overdue":
        return "逾期"
      case "refunded":
        return "已退款"
      case "processing":
        return "处理中"
      default:
        return "未知"
    }
  }

  const handlePayment = (method: string) => {
    setPaymentMethod(method)
    // Process payment logic here
    console.log(`Processing payment with ${method}`)
  }

  const handleRefund = () => {
    // Process refund logic here
    console.log(`Processing refund: ${refundAmount}, reason: ${refundReason}`)
    setShowRefundForm(false)
  }

  if (showRefundForm && selectedPayment) {
    return (
      <div className="p-4 space-y-4 max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" onClick={() => setShowRefundForm(false)} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">退款申请</h1>
            <p className="text-sm text-muted-foreground">{selectedPayment.patientName}</p>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">原付款信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">原付款金额</span>
              <span className="font-medium">¥{selectedPayment.amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">付款日期</span>
              <span className="font-medium">{selectedPayment.serviceDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">服务类型</span>
              <span className="font-medium">{selectedPayment.serviceType}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">退款详情</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">退款金额</label>
              <Input
                type="number"
                placeholder="请输入退款金额"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">退款原因</label>
              <select
                className="w-full p-2 border rounded-md"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
              >
                <option value="">请选择退款原因</option>
                <option value="service_cancelled">服务取消</option>
                <option value="quality_issue">服务质量问题</option>
                <option value="user_complaint">用户投诉</option>
                <option value="other">其他</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">备注说明</label>
              <Textarea placeholder="请输入详细说明..." className="w-full" rows={3} />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button onClick={handleRefund} className="w-full" size="lg">
            提交退款申请
          </Button>
          <Button variant="outline" onClick={() => setShowRefundForm(false)} className="w-full">
            取消
          </Button>
        </div>
      </div>
    )
  }

  if (showPaymentForm && selectedPayment) {
    return (
      <div className="p-4 space-y-4 max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" onClick={() => setShowPaymentForm(false)} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">收款处理</h1>
            <p className="text-sm text-muted-foreground">{selectedPayment.patientName}</p>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">付款详情</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center py-4">
              <div className="text-3xl font-bold text-primary">¥{selectedPayment.amount}</div>
              <p className="text-sm text-muted-foreground mt-1">{selectedPayment.serviceType}</p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">患者</span>
                <span>{selectedPayment.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">服务日期</span>
                <span>{selectedPayment.serviceDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">套餐类型</span>
                <span>{selectedPayment.packageType}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">选择支付方式</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-12 justify-start bg-green-50 hover:bg-green-100 border-green-200"
              onClick={() => handlePayment("wechat")}
            >
              <Smartphone className="h-5 w-5 mr-3 text-green-600" />
              <span className="text-green-700">微信支付</span>
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 justify-start bg-blue-50 hover:bg-blue-100 border-blue-200"
              onClick={() => handlePayment("alipay")}
            >
              <QrCode className="h-5 w-5 mr-3 text-blue-600" />
              <span className="text-blue-700">支付宝</span>
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 justify-start bg-orange-50 hover:bg-orange-100 border-orange-200"
              onClick={() => handlePayment("cash")}
            >
              <Banknote className="h-5 w-5 mr-3 text-orange-600" />
              <span className="text-orange-700">现金支付</span>
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 justify-start bg-purple-50 hover:bg-purple-100 border-purple-200"
              onClick={() => handlePayment("bank")}
            >
              <Building className="h-5 w-5 mr-3 text-purple-600" />
              <span className="text-purple-700">银行卡</span>
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button className="w-full" size="lg">
            生成付款码
          </Button>
          <Button variant="outline" className="w-full bg-transparent">
            联系家属代付
          </Button>
        </div>
      </div>
    )
  }

  if (selectedPayment) {
    return (
      <div className="p-4 space-y-4 max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" onClick={() => setSelectedPayment(null)} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">付款详情</h1>
            <p className="text-sm text-muted-foreground">{selectedPayment.patientName}</p>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="text-center py-4">
              <div className="text-3xl font-bold text-primary">¥{selectedPayment.amount}</div>
              <Badge variant="outline" className={`mt-2 ${getStatusColor(selectedPayment.status)}`}>
                {getStatusText(selectedPayment.status)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">付款信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block">患者姓名</span>
                <span className="font-medium">{selectedPayment.patientName}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">服务类型</span>
                <span className="font-medium">{selectedPayment.serviceType}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">服务日期</span>
                <span className="font-medium">{selectedPayment.serviceDate}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">套餐类型</span>
                <span className="font-medium">{selectedPayment.packageType}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">创建时间</span>
                <span className="font-medium">{selectedPayment.createdAt}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">截止时间</span>
                <span className="font-medium">{selectedPayment.dueDate}</span>
              </div>
            </div>
            {selectedPayment.paymentMethod && (
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">支付方式</span>
                  <span className="font-medium">
                    {selectedPayment.paymentMethod === "wechat" && "微信支付"}
                    {selectedPayment.paymentMethod === "alipay" && "支付宝"}
                    {selectedPayment.paymentMethod === "cash" && "现金"}
                    {selectedPayment.paymentMethod === "bank" && "银行卡"}
                  </span>
                </div>
                {selectedPayment.transactionId && (
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-muted-foreground">交易号</span>
                    <span className="font-medium text-xs">{selectedPayment.transactionId}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-3">
          {selectedPayment.status === "pending" && (
            <Button onClick={() => setShowPaymentForm(true)} className="w-full" size="lg">
              <CreditCard className="h-4 w-4 mr-2" />
              立即收款
            </Button>
          )}

          {selectedPayment.status === "overdue" && (
            <div className="space-y-2">
              <Button onClick={() => setShowPaymentForm(true)} className="w-full" size="lg">
                <CreditCard className="h-4 w-4 mr-2" />
                立即收款
              </Button>
              <Button variant="outline" className="w-full text-orange-600 border-orange-300 bg-transparent">
                <AlertTriangle className="h-4 w-4 mr-2" />
                发送催缴提醒
              </Button>
            </div>
          )}

          {selectedPayment.status === "paid" && (
            <div className="space-y-2">
              <Button variant="outline" className="w-full bg-transparent">
                <Receipt className="h-4 w-4 mr-2" />
                打印收据
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowRefundForm(true)}
                className="w-full text-red-600 border-red-300 bg-transparent"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                申请退款
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold">付款管理</h1>
          <p className="text-sm text-muted-foreground">管理患者付款和收费</p>
        </div>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-orange-600">2</div>
                <div className="text-xs text-muted-foreground">待收款</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-green-600">12</div>
                <div className="text-xs text-muted-foreground">已收款</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-red-600">1</div>
                <div className="text-xs text-muted-foreground">逾期</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-600">0</div>
                <div className="text-xs text-muted-foreground">退款</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {mockPayments.map((payment) => (
          <Card
            key={payment.id}
            className="shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedPayment(payment)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <div>
                    <span className="font-medium">{payment.patientName}</span>
                    <span className="text-sm text-muted-foreground ml-2">¥{payment.amount}</span>
                  </div>
                </div>
                <Badge variant="outline" className={getStatusColor(payment.status)}>
                  {getStatusText(payment.status)}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Package className="h-3 w-3 text-muted-foreground" />
                  <span>{payment.serviceType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span>{payment.serviceDate}</span>
                </div>
                {payment.packageType && (
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span>{payment.packageType}</span>
                  </div>
                )}
              </div>

              {payment.status === "overdue" && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center gap-2 text-red-600">
                    <Clock className="h-3 w-3" />
                    <span className="text-xs">
                      逾期 {Math.floor((Date.now() - new Date(payment.dueDate).getTime()) / (1000 * 60 * 60 * 24))} 天
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
