import { type NextRequest, NextResponse } from "next/server"

// 这个文件现在主要作为客户端和Flask服务器之间的代理
// 实际的患者数据现在从Flask服务器的 /api/v1/families 端点获取

// 兼容性路由 - 将请求转发到Flask服务器
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  // 如果是获取特定家庭的患者，转发到Flask服务器
  const familyId = searchParams.get("familyId")
  
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1'
    const url = familyId 
      ? `${apiBaseUrl}/families/${familyId}`
      : `${apiBaseUrl}/families`
    
    const response = await fetch(url, {
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`Flask服务器响应错误: ${response.status}`)
    }
    
    const data = await response.json()
    
    // 转换数据格式以保持兼容性
    if (familyId) {
      // 单个家庭的患者数据
      const family = data.data
      return NextResponse.json({ 
        patients: family.members || [] 
      })
    } else {
      // 所有家庭的患者数据
      const families = data.data.families || []
      const allPatients = families.flatMap((family: any) => 
        family.members?.map((member: any) => ({
          ...member,
          familyId: family.id,
          familyName: family.householdHead
        })) || []
      )
      
      return NextResponse.json({ 
        patients: allPatients,
        families: families 
      })
    }
  } catch (error) {
    console.error('代理到Flask服务器失败:', error)
    
    // 返回空数据而不是错误，以便前端可以正常处理
    return NextResponse.json({ 
      patients: [],
      families: [],
      error: '无法连接到后端服务器'
    }, { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1'
    
    // 如果是添加家庭成员
    if (body.familyId) {
      const response = await fetch(`${apiBaseUrl}/families/${body.familyId}/members`, {
        method: 'POST',
        headers: {
          'Authorization': request.headers.get('Authorization') || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      })
      
      if (!response.ok) {
        throw new Error(`Flask服务器响应错误: ${response.status}`)
      }
      
      const data = await response.json()
      return NextResponse.json({ patient: data.data }, { status: 201 })
    }
    
    // 否则创建新家庭
    const response = await fetch(`${apiBaseUrl}/families`, {
      method: 'POST',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })
    
    if (!response.ok) {
      throw new Error(`Flask服务器响应错误: ${response.status}`)
    }
    
    const data = await response.json()
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('创建失败:', error)
    return NextResponse.json({ 
      error: '创建失败，请检查网络连接' 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { familyId, id: memberId, ...updateData } = body
    
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1'
    
    const response = await fetch(`${apiBaseUrl}/families/${familyId}/members/${memberId}`, {
      method: 'PUT',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Patient not found" }, { status: 404 })
      }
      throw new Error(`Flask服务器响应错误: ${response.status}`)
    }
    
    const data = await response.json()
    return NextResponse.json({ patient: data.data })
  } catch (error) {
    console.error('更新失败:', error)
    return NextResponse.json({ 
      error: '更新失败，请检查网络连接' 
    }, { status: 500 })
  }
}
