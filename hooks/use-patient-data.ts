/**
 * 患者数据管理Hook
 * 提供患者数据的CRUD操作和状态管理
 */

import { useState, useEffect, useCallback } from 'react'
import { 
  getFamilies, 
  getFamilyDetail, 
  createFamily, 
  updateFamily, 
  deleteFamily,
  addFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
  withErrorHandling,
  type Family,
  type FamilyMember,
  type CreateFamilyRequest,
  type CreateMemberRequest
} from '@/lib/api'

// Hook返回值类型定义
interface UsePatientDataResult {
  // 数据状态
  families: Family[]
  selectedFamily: Family | null
  selectedPatient: FamilyMember | null
  loading: boolean
  error: string | null
  
  // 分页信息
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    hasNext: boolean
    hasPrev: boolean
  }
  
  // 数据操作方法
  fetchFamilies: (page?: number, limit?: number, search?: string) => Promise<void>
  fetchFamilyDetail: (familyId: string) => Promise<void>
  createNewFamily: (data: CreateFamilyRequest) => Promise<void>
  updateFamilyInfo: (familyId: string, data: Partial<CreateFamilyRequest>) => Promise<void>
  removeFamilyById: (familyId: string) => Promise<void>
  
  // 成员操作方法
  addMemberToFamily: (familyId: string, data: CreateMemberRequest) => Promise<void>
  updateMemberInfo: (familyId: string, memberId: string, data: Partial<CreateMemberRequest>) => Promise<void>
  removeMemberFromFamily: (familyId: string, memberId: string) => Promise<void>
  
  // 状态设置方法
  setSelectedFamily: (family: Family | null) => void
  setSelectedPatient: (patient: FamilyMember | null) => void
  clearError: () => void
  refreshData: () => Promise<void>
}

export const usePatientData = (): UsePatientDataResult => {
  // 状态定义
  const [families, setFamilies] = useState<Family[]>([])
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null)
  const [selectedPatient, setSelectedPatient] = useState<FamilyMember | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false,
  })

  // 搜索参数状态
  const [searchParams, setSearchParams] = useState({
    page: 1,
    limit: 20,
    search: '',
  })

  // 错误处理函数
  const handleError = useCallback((error: unknown) => {
    console.error('API Error:', error)
    if (error instanceof Error) {
      setError(error.message)
    } else {
      setError('发生未知错误')
    }
  }, [])

  // 清除错误
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // 获取家庭列表
  const fetchFamilies = useCallback(async (
    page: number = searchParams.page,
    limit: number = searchParams.limit,
    search: string = searchParams.search
  ) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await withErrorHandling(() => getFamilies(page, limit, search))
      
      if (response.code === 200) {
        setFamilies(response.data.families)
        setPagination(response.data.pagination)
        setSearchParams({ page, limit, search })
      } else {
        throw new Error(response.message)
      }
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }, [searchParams, handleError])

  // 获取家庭详情
  const fetchFamilyDetail = useCallback(async (familyId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await withErrorHandling(() => getFamilyDetail(familyId))
      
      if (response.code === 200) {
        setSelectedFamily(response.data)
      } else {
        throw new Error(response.message)
      }
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }, [handleError])

  // 创建新家庭
  const createNewFamily = useCallback(async (data: CreateFamilyRequest) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await withErrorHandling(() => createFamily(data))
      
      if (response.code === 200) {
        // 创建成功后刷新列表
        await fetchFamilies()
      } else {
        throw new Error(response.message)
      }
    } catch (error) {
      handleError(error)
      throw error // 重新抛出错误，让调用方处理UI反馈
    } finally {
      setLoading(false)
    }
  }, [fetchFamilies, handleError])

  // 更新家庭信息
  const updateFamilyInfo = useCallback(async (
    familyId: string, 
    data: Partial<CreateFamilyRequest>
  ) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await withErrorHandling(() => updateFamily(familyId, data))
      
      if (response.code === 200) {
        // 更新本地状态
        setFamilies(prev => 
          prev.map(family => 
            family.id === familyId ? response.data : family
          )
        )
        
        // 如果当前选中的家庭被更新，也要更新选中状态
        if (selectedFamily && selectedFamily.id === familyId) {
          setSelectedFamily(response.data)
        }
      } else {
        throw new Error(response.message)
      }
    } catch (error) {
      handleError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [selectedFamily, handleError])

  // 删除家庭
  const removeFamilyById = useCallback(async (familyId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await withErrorHandling(() => deleteFamily(familyId))
      
      if (response.code === 200) {
        // 从列表中移除
        setFamilies(prev => prev.filter(family => family.id !== familyId))
        
        // 如果删除的是当前选中的家庭，清除选中状态
        if (selectedFamily && selectedFamily.id === familyId) {
          setSelectedFamily(null)
        }
      } else {
        throw new Error(response.message)
      }
    } catch (error) {
      handleError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [selectedFamily, handleError])

  // 添加家庭成员
  const addMemberToFamily = useCallback(async (
    familyId: string, 
    data: CreateMemberRequest
  ) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await withErrorHandling(() => addFamilyMember(familyId, data))
      
      if (response.code === 200) {
        // 刷新家庭详情
        await fetchFamilyDetail(familyId)
      } else {
        throw new Error(response.message)
      }
    } catch (error) {
      handleError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [fetchFamilyDetail, handleError])

  // 更新家庭成员
  const updateMemberInfo = useCallback(async (
    familyId: string, 
    memberId: string, 
    data: Partial<CreateMemberRequest>
  ) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await withErrorHandling(() => 
        updateFamilyMember(familyId, memberId, data)
      )
      
      if (response.code === 200) {
        // 更新本地状态
        if (selectedFamily && selectedFamily.id === familyId) {
          const updatedFamily = {
            ...selectedFamily,
            members: selectedFamily.members.map(member =>
              member.id === memberId ? response.data : member
            )
          }
          setSelectedFamily(updatedFamily)
        }
        
        // 如果当前选中的患者被更新
        if (selectedPatient && selectedPatient.id === memberId) {
          setSelectedPatient(response.data)
        }
        
        // 也要更新families列表中的数据
        setFamilies(prev =>
          prev.map(family => {
            if (family.id === familyId) {
              return {
                ...family,
                members: family.members.map(member =>
                  member.id === memberId ? response.data : member
                )
              }
            }
            return family
          })
        )
      } else {
        throw new Error(response.message)
      }
    } catch (error) {
      handleError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [selectedFamily, selectedPatient, handleError])

  // 删除家庭成员
  const removeMemberFromFamily = useCallback(async (
    familyId: string, 
    memberId: string
  ) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await withErrorHandling(() => 
        deleteFamilyMember(familyId, memberId)
      )
      
      if (response.code === 200) {
        // 更新本地状态
        if (selectedFamily && selectedFamily.id === familyId) {
          const updatedFamily = {
            ...selectedFamily,
            members: selectedFamily.members.filter(member => member.id !== memberId),
            totalMembers: selectedFamily.totalMembers - 1
          }
          setSelectedFamily(updatedFamily)
        }
        
        // 如果删除的是当前选中的患者，清除选中状态
        if (selectedPatient && selectedPatient.id === memberId) {
          setSelectedPatient(null)
        }
        
        // 也要更新families列表中的数据
        setFamilies(prev =>
          prev.map(family => {
            if (family.id === familyId) {
              return {
                ...family,
                members: family.members.filter(member => member.id !== memberId),
                totalMembers: family.totalMembers - 1
              }
            }
            return family
          })
        )
      } else {
        throw new Error(response.message)
      }
    } catch (error) {
      handleError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [selectedFamily, selectedPatient, handleError])

  // 刷新数据
  const refreshData = useCallback(async () => {
    await fetchFamilies()
  }, [fetchFamilies])

  // 初始化时获取数据
  useEffect(() => {
    fetchFamilies()
  }, [fetchFamilies])

  return {
    // 数据状态
    families,
    selectedFamily,
    selectedPatient,
    loading,
    error,
    pagination,
    
    // 数据操作方法
    fetchFamilies,
    fetchFamilyDetail,
    createNewFamily,
    updateFamilyInfo,
    removeFamilyById,
    
    // 成员操作方法
    addMemberToFamily,
    updateMemberInfo,
    removeMemberFromFamily,
    
    // 状态设置方法
    setSelectedFamily,
    setSelectedPatient,
    clearError,
    refreshData,
  }
}