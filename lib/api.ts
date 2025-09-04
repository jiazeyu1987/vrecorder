/**
 * API客户端 - 与Flask后端服务通信
 */

// API基础配置
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1'

import { SessionManager } from './session-manager'

// 请求头配置
const getHeaders = () => {
  const token = SessionManager.getAccessToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  
  // 只有当token存在且不是undefined/null时才添加Authorization头
  if (token && token !== 'undefined' && token !== 'null') {
    headers.Authorization = `Bearer ${token}`
  }
  
  return headers
}

// 通用请求方法
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  
  // 检查是否有有效的token（对于需要认证的端点）
  const token = SessionManager.getAccessToken()
  const needsAuth = !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')
  
  console.log('API Request Debug:', {
    endpoint,
    url,
    needsAuth,
    token: token ? `${token.substring(0, 20)}...` : 'null',
    hasValidToken: !!(token && token !== 'undefined' && token !== 'null')
  })
  
  if (needsAuth && (!token || token === 'undefined' || token === 'null')) {
    // 没有有效token，清理会话并重定向到登录页
    console.error('API Request: No valid token, clearing session')
    SessionManager.clearSession()
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    throw new Error('请先登录')
  }
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  })
  
  if (!response.ok) {
    // 如果返回401或422（未授权），清理会话并重定向
    if (response.status === 401 || response.status === 422) {
      SessionManager.clearSession()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      throw new Error('登录已过期，请重新登录')
    }
    
    const error = await response.json()
    throw new Error(error.message || `HTTP ${response.status}`)
  }
  
  return response.json()
}

// ========== 家庭档案 API ==========

export interface FamilyMember {
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
  phone?: string
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface Family {
  id: string
  householdHead: string
  address: string
  phone: string
  members: FamilyMember[]
  totalMembers: number
  lastService: string
  created_at?: string
  updated_at?: string
}

export interface FamiliesResponse {
  code: number
  message: string
  data: {
    families: Family[]
    pagination: {
      current_page: number
      per_page: number
      total_pages: number
      total_items: number
      has_next: boolean
      has_prev: boolean
    }
  }
}

export interface FamilyDetailResponse {
  code: number
  message: string
  data: Family
}

export interface CreateFamilyRequest {
  householdHead: string
  address: string
  phone: string
  members: Array<{
    name: string
    age: number
    gender: string
    relationship: string
    conditions: string
    packageType: string
    medications?: string
  }>
}

// 获取家庭列表
export const getFamilies = async (
  page: number = 1,
  limit: number = 20,
  search: string = ''
): Promise<FamiliesResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search })
  })
  
  return apiRequest(`/families?${params.toString()}`)
}

// 获取家庭详情
export const getFamilyDetail = async (familyId: string): Promise<FamilyDetailResponse> => {
  return apiRequest(`/families/${familyId}`)
}

// 创建家庭档案
export const createFamily = async (data: CreateFamilyRequest) => {
  return apiRequest('/families', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// 更新家庭信息
export const updateFamily = async (familyId: string, data: Partial<CreateFamilyRequest>) => {
  return apiRequest(`/families/${familyId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

// 删除家庭档案
export const deleteFamily = async (familyId: string) => {
  return apiRequest(`/families/${familyId}`, {
    method: 'DELETE',
  })
}

// ========== 家庭成员 API ==========

export interface CreateMemberRequest {
  name: string
  age: number
  gender: string
  relationship: string
  conditions: string
  packageType: string
  medications?: string
  phone?: string
}

// 添加家庭成员
export const addFamilyMember = async (familyId: string, data: CreateMemberRequest) => {
  return apiRequest(`/families/${familyId}/members`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// 更新家庭成员
export const updateFamilyMember = async (
  familyId: string, 
  memberId: string, 
  data: Partial<CreateMemberRequest>
) => {
  return apiRequest(`/families/${familyId}/members/${memberId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

// 删除家庭成员
export const deleteFamilyMember = async (familyId: string, memberId: string) => {
  return apiRequest(`/families/${familyId}/members/${memberId}`, {
    method: 'DELETE',
  })
}

// ========== 认证 API ==========

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  code: number
  message: string
  data: {
    access_token: string
    refresh_token: string
    user: {
      id: number
      username: string
      role: string
      name: string
    }
  }
}

// 用户登录
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
  
  // 登录成功后通过SessionManager保存token
  if (response.code === 200) {
    SessionManager.createSession(
      response.data.user,
      {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
      },
      false // 默认不记住登录状态，可根据需要调整
    )
  }
  
  return response
}

// 刷新token
export const refreshToken = async () => {
  const refreshTokenValue = SessionManager.getRefreshToken()
  if (!refreshTokenValue) {
    throw new Error('No refresh token available')
  }
  
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${refreshTokenValue}`,
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    // 刷新失败，清除会话
    SessionManager.clearSession()
    throw new Error('Token refresh failed')
  }
  
  const data = await response.json()
  
  // 更新token
  if (data.code === 200) {
    SessionManager.updateAccessToken(data.data.access_token)
  }
  
  return data
}

// 登出
export const logout = () => {
  SessionManager.clearSession()
}

// ========== 工具函数 ==========

// 检查是否已登录
export const isAuthenticated = (): boolean => {
  return SessionManager.validateSession().isValid
}

// 获取当前用户信息
export const getCurrentUser = () => {
  const session = SessionManager.getSession()
  return session ? session.user : null
}

// 错误处理中间件
export const withErrorHandling = async <T>(apiCall: () => Promise<T>): Promise<T> => {
  try {
    return await apiCall()
  } catch (error) {
    if (error instanceof Error && error.message.includes('401')) {
      // Token可能过期，尝试刷新
      try {
        await refreshToken()
        // 重试原始请求
        return await apiCall()
      } catch (refreshError) {
        // 刷新失败，跳转到登录页
        logout()
        window.location.href = '/login'
        throw new Error('登录已过期，请重新登录')
      }
    }
    throw error
  }
}

// ========== 预约/日程 API ==========

export interface ServiceType {
  id: number
  name: string
  description?: string
  default_duration?: number
  base_price?: number
  is_active: boolean
  created_at?: string
}

export interface Payment {
  id: number
  amount: number
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_method: 'wechat' | 'alipay' | 'cash' | 'bank_card' | 'other'
  payment_date?: string
}

export interface Appointment {
  id: number
  patient_id: number
  recorder_id: number
  service_type_id?: number
  scheduled_date: string
  start_time: string
  end_time?: string
  duration_minutes?: number
  appointment_type: 'regular' | 'makeup' | 'emergency'
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled'
  notes?: string
  created_at?: string
  updated_at?: string
  patient?: {
    id: number
    name: string
    age: number
    gender: string
    relationship: string
    phone?: string
    family_id: number
    family?: {
      householdHead: string
      address: string
      phone: string
    }
  }
  payment?: Payment
}

export interface CreateAppointmentRequest {
  patient_id: number
  service_type_id?: number
  scheduled_date: string
  scheduled_time: string // 后端期望的字段名
  appointment_type?: 'regular' | 'makeup' | 'emergency'
  status?: 'scheduled' | 'confirmed'
  notes?: string
  payment?: {
    amount: number
    payment_method: 'wechat' | 'alipay' | 'cash' | 'bank_card' | 'other'
    payment_status?: 'pending' | 'paid'
    notes?: string
  }
}

export interface AppointmentListResponse {
  code: number
  message: string
  data: {
    appointments: Appointment[]
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface AppointmentResponse {
  code: number
  message: string
  data: Appointment
}

export interface ServiceTypesResponse {
  code: number
  message: string
  data: ServiceType[]
}

// 获取今日预约列表
export const getTodayAppointments = async (): Promise<AppointmentListResponse> => {
  return apiRequest('/appointments/today')
}

// 获取预约列表
export const getAppointments = async (
  page: number = 1,
  limit: number = 20,
  status: string = '',
  date_from: string = '',
  date_to: string = ''
): Promise<AppointmentListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(status && { status }),
    ...(date_from && { date_from }),
    ...(date_to && { date_to })
  })
  
  return apiRequest(`/appointments?${params.toString()}`)
}

// 获取预约详情
export const getAppointmentDetail = async (appointmentId: number): Promise<AppointmentResponse> => {
  return apiRequest(`/appointments/${appointmentId}`)
}

// 创建预约
export const createAppointment = async (data: CreateAppointmentRequest): Promise<AppointmentResponse> => {
  console.log('API: 创建预约请求数据', data)
  return apiRequest('/appointments', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// 更新预约
export const updateAppointment = async (
  appointmentId: number, 
  data: Partial<CreateAppointmentRequest>
): Promise<AppointmentResponse> => {
  console.log('API: 更新预约请求', appointmentId, data)
  return apiRequest(`/appointments/${appointmentId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

// 删除预约
export const deleteAppointment = async (appointmentId: number) => {
  console.log('API: 删除预约', appointmentId)
  return apiRequest(`/appointments/${appointmentId}`, {
    method: 'DELETE',
  })
}

// 完成预约
export const completeAppointment = async (appointmentId: number): Promise<AppointmentResponse> => {
  console.log('API: 完成预约', appointmentId)
  return apiRequest(`/appointments/${appointmentId}/complete`, {
    method: 'POST',
  })
}

// 获取服务类型列表
export const getServiceTypes = async (): Promise<ServiceTypesResponse> => {
  return apiRequest('/service-types')
}