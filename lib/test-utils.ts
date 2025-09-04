/**
 * 测试工具 - 用于测试API集成
 */

import { 
  getFamilies, 
  createFamily,
  type CreateFamilyRequest,
  type Family 
} from '@/lib/api'

// 模拟认证token（仅用于测试）
const mockToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.test'

// 设置测试用的mock token
export const setMockAuth = () => {
  localStorage.setItem('access_token', mockToken)
  localStorage.setItem('user_info', JSON.stringify({
    id: 1,
    username: 'recorder001',
    role: 'recorder',
    name: '记录员001'
  }))
}

// 清除认证信息
export const clearAuth = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token') 
  localStorage.removeItem('user_info')
}

// 测试数据
export const testFamilyData: CreateFamilyRequest = {
  householdHead: "李大爷",
  address: "北京市朝阳区测试小区1号楼101",
  phone: "13800138888",
  members: [
    {
      name: "李大爷",
      age: 75,
      gender: "男",
      relationship: "户主",
      conditions: "高血压,糖尿病",
      packageType: "标准套餐",
      medications: "降压药,降糖药"
    },
    {
      name: "李奶奶",
      age: 72,
      gender: "女", 
      relationship: "配偶",
      conditions: "关节炎",
      packageType: "基础套餐",
      medications: "止痛药"
    }
  ]
}

// 测试API调用
export const testApiCalls = async () => {
  console.log('开始测试API调用...')
  
  try {
    setMockAuth()
    
    // 测试获取家庭列表
    console.log('测试获取家庭列表...')
    const familiesResponse = await getFamilies(1, 10)
    console.log('家庭列表响应:', familiesResponse)
    
    // 测试创建家庭
    console.log('测试创建家庭...')
    const createResponse = await createFamily(testFamilyData)
    console.log('创建家庭响应:', createResponse)
    
    return {
      success: true,
      familiesCount: familiesResponse.data?.families?.length || 0,
      createdFamily: createResponse
    }
  } catch (error) {
    console.error('API测试失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }
  }
}

// 直接测试后端API（绕过认证）
export const testDirectAPI = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/v1/families', {
      headers: {
        'Authorization': `Bearer ${mockToken}`,
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json()
    console.log('直接API调用结果:', data)
    return data
  } catch (error) {
    console.error('直接API调用失败:', error)
    return { error: error instanceof Error ? error.message : '未知错误' }
  }
}