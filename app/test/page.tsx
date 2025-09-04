"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { testApiCalls, testDirectAPI, setMockAuth, clearAuth } from "@/lib/test-utils"

interface TestResult {
  success: boolean
  familiesCount?: number
  createdFamily?: any
  error?: string
  data?: any
}

export default function TestPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [directApiResult, setDirectApiResult] = useState<any>(null)

  const handleTestApi = async () => {
    setIsLoading(true)
    try {
      const result = await testApiCalls()
      setTestResult(result)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestDirectApi = async () => {
    setIsLoading(true)
    try {
      const result = await testDirectAPI()
      setDirectApiResult(result)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetAuth = () => {
    setMockAuth()
    alert('已设置模拟认证token')
  }

  const handleClearAuth = () => {
    clearAuth()
    alert('已清除认证信息')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>API集成测试工具</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <Button onClick={handleSetAuth}>设置模拟认证</Button>
              <Button onClick={handleClearAuth} variant="outline">清除认证</Button>
              <Button onClick={handleTestApi} disabled={isLoading}>
                {isLoading ? '测试中...' : '测试API调用'}
              </Button>
              <Button onClick={handleTestDirectApi} disabled={isLoading} variant="secondary">
                {isLoading ? '测试中...' : '测试直接API'}
              </Button>
            </div>

            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
              <p>测试步骤：</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>确保Flask服务器在 http://localhost:5000 运行</li>
                <li>点击"设置模拟认证"设置测试token</li>
                <li>点击"测试API调用"测试完整的API集成</li>
                <li>点击"测试直接API"测试与Flask服务器的直接通信</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {testResult && (
          <Card>
            <CardHeader>
              <CardTitle className={testResult.success ? "text-green-600" : "text-red-600"}>
                API集成测试结果
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {directApiResult && (
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">
                直接API调用结果
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(directApiResult, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>开发者信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>当前URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
              <p><strong>API Base URL:</strong> {process.env.NEXT_PUBLIC_API_BASE_URL}</p>
              <p><strong>认证Token:</strong> {typeof window !== 'undefined' ? (localStorage.getItem('access_token') ? '已设置' : '未设置') : 'N/A'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}