import { useState, useCallback } from 'react'
import { request } from '@/api/auth'

export interface AdminAccount {
  userId: string
  email: string
  phone?: string
  fullName: string
  role: string
  emailVerified: boolean
  phoneVerified: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AdminAccountsResponse {
  success: boolean
  data: AdminAccount[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  timestamp: string
}

export interface AdminAccountResponse {
  success: boolean
  data: AdminAccount
  message?: string
  timestamp: string
}

interface CreateAdminPayload {
  email: string
  password: string
  fullName: string
  phone?: string
}

interface UpdateAdminPayload {
  email?: string
  fullName?: string
  phone?: string
}

interface ReactivatePayload {
  password: string
}

export function useAdminAccounts() {
  const [accounts, setAccounts] = useState<AdminAccount[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  const handleError = useCallback((err: unknown) => {
    const message =
      err instanceof Error ? err.message : 'An unexpected error occurred'
    setError(message)
    console.error('Admin accounts error:', err)
  }, [])

  const fetchAccounts = useCallback(
    async (
      page: number = 1,
      limit: number = 10,
      status?: 'active' | 'inactive',
      search?: string,
      role?: string
    ) => {
      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        params.append('page', page.toString())
        params.append('limit', limit.toString())
        if (status) params.append('status', status)
        if (search) params.append('search', search)
        if (role) params.append('role', role)

        const response = (await request(`/admin/users?${params.toString()}`, {
          method: 'GET',
        })) as AdminAccountsResponse

        if (response.success) {
          setAccounts(response.data)
          setPagination(response.pagination)
        } else {
          throw new Error('Failed to fetch user accounts')
        }
      } catch (err) {
        handleError(err)
      } finally {
        setIsLoading(false)
      }
    },
    [handleError]
  )

  const getAccountById = useCallback(
    async (id: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = (await request(`/admin/accounts/${id}`, {
          method: 'GET',
        })) as AdminAccountResponse

        if (response.success) {
          return response.data
        } else {
          throw new Error('Failed to fetch admin account')
        }
      } catch (err) {
        handleError(err)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [handleError]
  )

  const createAccount = useCallback(
    async (payload: CreateAdminPayload) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = (await request('/admin/accounts', {
          method: 'POST',
          body: payload,
        })) as AdminAccountResponse

        if (response.success) {
          setAccounts((prev) => [response.data, ...prev])
          return response.data
        } else {
          throw new Error('Failed to create admin account')
        }
      } catch (err) {
        handleError(err)
        setIsLoading(false)
        throw err
      }
    },
    [handleError]
  )

  const updateAccount = useCallback(
    async (id: string, payload: UpdateAdminPayload) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = (await request(`/admin/accounts/${id}`, {
          method: 'PUT',
          body: payload,
        })) as AdminAccountResponse

        if (response.success) {
          setAccounts((prev) =>
            prev.map((account) =>
              account.userId === id ? response.data : account
            )
          )
          return response.data
        } else {
          throw new Error('Failed to update admin account')
        }
      } catch (err) {
        handleError(err)
        setIsLoading(false)
        throw err
      }
    },
    [handleError]
  )

  const deactivateAccount = useCallback(
    async (id: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = (await request(`/admin/accounts/${id}/deactivate`, {
          method: 'POST',
        })) as AdminAccountResponse

        if (response.success) {
          setAccounts((prev) =>
            prev.map((account) =>
              account.userId === id ? response.data : account
            )
          )
          return response.data
        } else {
          throw new Error('Failed to deactivate admin account')
        }
      } catch (err) {
        handleError(err)
        setIsLoading(false)
        throw err
      }
    },
    [handleError]
  )

  const reactivateAccount = useCallback(
    async (id: string, payload: ReactivatePayload) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = (await request(`/admin/accounts/${id}/reactivate`, {
          method: 'POST',
          body: payload,
        })) as AdminAccountResponse

        if (response.success) {
          setAccounts((prev) =>
            prev.map((account) =>
              account.userId === id ? response.data : account
            )
          )
          return response.data
        } else {
          throw new Error('Failed to reactivate admin account')
        }
      } catch (err) {
        handleError(err)
        setIsLoading(false)
        throw err
      }
    },
    [handleError]
  )

  const resetPassword = useCallback(
    async (id: string, newPassword: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = (await request(`/admin/users/${id}/reset-password`, {
          method: 'POST',
          body: { newPassword },
        })) as AdminAccountResponse

        if (response.success) {
          // For reset password, we don't update the accounts list since it's just password change
          return response.data
        } else {
          throw new Error('Failed to reset user password')
        }
      } catch (err) {
        handleError(err)
        setIsLoading(false)
        throw err
      }
    },
    [handleError]
  )

  const deactivateUser = useCallback(
    async (id: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = (await request(`/admin/users/${id}/deactivate`, {
          method: 'POST',
        })) as AdminAccountResponse

        if (response.success) {
          // Update local state to reflect deactivation
          setAccounts((prev) =>
            prev.map((account) =>
              account.userId === id ? { ...account, isActive: false } : account
            )
          )
          return response.data
        } else {
          throw new Error('Failed to deactivate user')
        }
      } catch (err) {
        handleError(err)
        setIsLoading(false)
        throw err
      }
    },
    [handleError]
  )

  const reactivateUser = useCallback(
    async (id: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = (await request(`/admin/users/${id}/reactivate`, {
          method: 'POST',
        })) as AdminAccountResponse

        if (response.success) {
          // Update local state to reflect reactivation
          setAccounts((prev) =>
            prev.map((account) =>
              account.userId === id ? { ...account, isActive: true } : account
            )
          )
          return response.data
        } else {
          throw new Error('Failed to reactivate user')
        }
      } catch (err) {
        handleError(err)
        setIsLoading(false)
        throw err
      }
    },
    [handleError]
  )

  return {
    accounts,
    isLoading,
    error,
    pagination,
    fetchAccounts,
    getAccountById,
    createAccount,
    updateAccount,
    deactivateAccount,
    reactivateAccount,
    resetPassword,
    deactivateUser,
    reactivateUser,
  }
}
