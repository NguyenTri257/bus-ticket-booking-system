import React, { useState, useEffect } from 'react'
import { X, Eye, EyeOff } from 'lucide-react'
import type { AdminAccount } from '@/hooks/admin/useAdminAccounts'

interface AdminAccountFormDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: FormData) => Promise<void>
  editingAccount?: AdminAccount | null
  isLoading?: boolean
}

interface FormData {
  email: string
  fullName: string
  phone: string
  password?: string
}

interface FormErrors {
  email?: string
  fullName?: string
  phone?: string
  password?: string
}

export const AdminAccountFormDrawer: React.FC<AdminAccountFormDrawerProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingAccount,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    fullName: '',
    phone: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (editingAccount) {
      setFormData({
        email: editingAccount.email,
        fullName: editingAccount.fullName,
        phone: editingAccount.phone || '',
      })
    } else {
      setFormData({
        email: '',
        fullName: '',
        phone: '',
      })
    }
    setErrors({})
    setShowPassword(false)
  }, [editingAccount, isOpen])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Full name validation
    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required'
    } else if (formData.fullName.length < 2 || formData.fullName.length > 100) {
      newErrors.fullName = 'Full name must be between 2 and 100 characters'
    }

    // Phone validation (optional but if provided must be valid)
    if (formData.phone) {
      if (!/^\d{10,15}$/.test(formData.phone.replace(/\D/g, ''))) {
        newErrors.phone = 'Phone must be 10-15 digits'
      }
    }

    // Password validation (required for new accounts)
    if (!editingAccount && !formData.password) {
      newErrors.password = 'Password is required for new accounts'
    } else if (formData.password) {
      if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters'
      } else if (!/[A-Z]/.test(formData.password)) {
        newErrors.password = 'Password must contain an uppercase letter'
      } else if (!/[a-z]/.test(formData.password)) {
        newErrors.password = 'Password must contain a lowercase letter'
      } else if (!/\d/.test(formData.password)) {
        newErrors.password = 'Password must contain a number'
      } else if (!/[@$!%*?&#]/.test(formData.password)) {
        newErrors.password =
          'Password must contain a special character (@$!%*?&#)'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      const submitData: FormData = {
        email: formData.email,
        fullName: formData.fullName,
        phone: formData.phone,
      }

      // Only include password if it's provided
      if (formData.password) {
        submitData.password = formData.password
      }

      await onSubmit(submitData)
      onClose()
    } catch (error) {
      // Error handling is done in parent component
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md transform overflow-y-auto bg-background shadow-lg transition-transform duration-200 ease-in-out">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 p-6">
          <h2 className="text-xl font-semibold text-foreground">
            {editingAccount ? 'Edit Admin Account' : 'Create Admin Account'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email Address <span className="text-destructive">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="admin@example.com"
              className={`w-full px-3 py-2 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground transition-colors ${
                errors.email
                  ? 'border-destructive focus:ring-destructive'
                  : 'border-input focus:ring-primary'
              } focus:outline-none focus:ring-2`}
              disabled={isLoading || isSubmitting}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Full Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="John Doe"
              className={`w-full px-3 py-2 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground transition-colors ${
                errors.fullName
                  ? 'border-destructive focus:ring-destructive'
                  : 'border-input focus:ring-primary'
              } focus:outline-none focus:ring-2`}
              disabled={isLoading || isSubmitting}
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-destructive">{errors.fullName}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="0912345678"
              className={`w-full px-3 py-2 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground transition-colors ${
                errors.phone
                  ? 'border-destructive focus:ring-destructive'
                  : 'border-input focus:ring-primary'
              } focus:outline-none focus:ring-2`}
              disabled={isLoading || isSubmitting}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-destructive">{errors.phone}</p>
            )}
            {!editingAccount && (
              <p className="mt-1 text-xs text-muted-foreground">
                Optional: 10-15 digits
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Password{' '}
              {!editingAccount && <span className="text-destructive">*</span>}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password || ''}
                onChange={handleInputChange}
                placeholder={
                  editingAccount ? 'Leave blank to keep current' : ''
                }
                className={`w-full px-3 py-2 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground transition-colors ${
                  errors.password
                    ? 'border-destructive focus:ring-destructive'
                    : 'border-input focus:ring-primary'
                } focus:outline-none focus:ring-2 pr-10`}
                disabled={isLoading || isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-destructive">{errors.password}</p>
            )}
            {!editingAccount && (
              <p className="mt-1 text-xs text-muted-foreground">
                Min 8 chars with uppercase, lowercase, number, and special
                character (@$!%*?&#)
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-input bg-background text-foreground hover:bg-muted transition-colors font-medium"
              disabled={isLoading || isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={isLoading || isSubmitting}
            >
              {isSubmitting && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/70 border-t-transparent" />
              )}
              {isSubmitting
                ? 'Saving...'
                : editingAccount
                  ? 'Update Admin'
                  : 'Create Admin'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
