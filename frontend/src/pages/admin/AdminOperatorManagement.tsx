import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/admin/DashboardLayout'
import {
  Eye,
  Check,
  X,
  UserCheck,
  UserX,
  BarChart3,
  Users,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'

interface OperatorAnalytics {
  operatorId: string
  name: string
  rating: number
  totalTrips: number
  completedTrips: number
  cancelledTrips: number
  avgOccupancy: number
  totalRevenue: number
  totalBookings: number
  avgTicketPrice: number
  totalRoutes: number
  totalBuses: number
}
import { useAdminOperators } from '@/hooks/admin/useAdminOperators'
import { OperatorDetailsDrawer } from '@/components/admin/OperatorDetailsDrawer'
//import { OperatorFormDrawer } from '@/components/admin/OperatorFormDrawer'
import {
  AdminTable,
  AdminTableRow,
  AdminTableCell,
  AdminTablePagination,
  StatusBadge,
} from '@/components/admin/table'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ErrorModal } from '@/components/ui/error-modal'
import { ReasonModal } from '@/components/ui/reason-modal'
import { SearchInput } from '@/components/ui/search-input'
import { CustomDropdown } from '@/components/ui/custom-dropdown'
import { AdminLoadingSpinner } from '@/components/admin/AdminLoadingSpinner'
import { AdminEmptyState } from '@/components/admin/AdminEmptyState'

const AdminOperatorManagement: React.FC = () => {
  const ITEMS_PER_PAGE = 5
  const {
    operators,
    isLoading,
    fetchOperators,
    approveOperator,
    rejectOperator,
    suspendOperator,
    activateOperator,
    fetchOperatorAnalytics,
  } = useAdminOperators()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<{
    total: number
    page: number
    limit: number
    totalPages: number
  } | null>(null)
  const [showDetails, setShowDetails] = useState<string | null>(null)
  // const [editingOperator, setEditingOperator] =
  //   useState<OperatorAdminData | null>(null)
  // const [showFormDrawer, setShowFormDrawer] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    title: string
    message: string
    onConfirm: () => void
    confirmText?: string
    cancelText?: string
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  })
  const [errorModal, setErrorModal] = useState<{
    open: boolean
    title: string
    message: string
  }>({
    open: false,
    title: '',
    message: '',
  })

  const [reasonModal, setReasonModal] = useState<{
    open: boolean
    title: string
    action: 'suspend' | 'reject'
    onConfirm: (reason: string) => void
  }>({
    open: false,
    title: '',
    action: 'suspend',
    onConfirm: () => {},
  })

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [operatorAnalytics, setOperatorAnalytics] = useState<
    Record<string, OperatorAnalytics>
  >({})
  const [analyticsLoading, setAnalyticsLoading] = useState<Set<string>>(
    new Set()
  )

  useEffect(() => {
    // Fetch all operators
    fetchOperators(undefined, 1, 100)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredOperators = operators.filter((operator) => {
    const matchesStatus =
      statusFilter === 'ALL' ||
      operator.status.toLowerCase() === statusFilter.toLowerCase()
    const matchesSearch =
      !searchTerm ||
      operator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operator.contact_email.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const totalFiltered = filteredOperators.length
  const totalPages = Math.ceil(totalFiltered / ITEMS_PER_PAGE)
  const paginatedOperators = filteredOperators.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  useEffect(() => {
    setPagination({
      total: totalFiltered,
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      totalPages,
    })
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [totalFiltered, currentPage, totalPages])

  const getStatusBadgeProps = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return { status: 'success' as const, label: 'Approved' }
      case 'pending':
        return { status: 'warning' as const, label: 'Pending' }
      case 'rejected':
        return { status: 'danger' as const, label: 'Rejected' }
      case 'suspended':
        return { status: 'danger' as const, label: 'Suspended' }
      default:
        return { status: 'default' as const, label: status }
    }
  }

  const handleApproveOperator = async (operator_id: string) => {
    const operator = operators.find((op) => op.operator_id === operator_id)
    if (!operator) return

    setConfirmDialog({
      open: true,
      title: 'Approve Operator',
      message: `Are you sure you want to approve ${operator.name}? This will grant them access to the platform.`,
      onConfirm: async () => {
        setActionLoading(operator_id)
        try {
          await approveOperator(operator_id, 'Approved via admin panel')
          setConfirmDialog({
            open: false,
            title: '',
            message: '',
            onConfirm: () => {},
          })
        } catch (error) {
          setErrorModal({
            open: true,
            title: 'Approval Failed',
            message:
              error instanceof Error
                ? error.message
                : 'Failed to approve operator',
          })
        } finally {
          setActionLoading(null)
        }
      },
    })
  }

  const handleRejectOperator = async (operator_id: string) => {
    const operator = operators.find((op) => op.operator_id === operator_id)
    if (!operator) return

    setReasonModal({
      open: true,
      title: 'Reject Operator',
      action: 'reject',
      onConfirm: async (reason: string) => {
        setActionLoading(operator_id)
        try {
          await rejectOperator(operator_id, reason)
          setReasonModal({
            open: false,
            title: '',
            action: 'reject',
            onConfirm: () => {},
          })
        } catch (error) {
          setErrorModal({
            open: true,
            title: 'Rejection Failed',
            message:
              error instanceof Error
                ? error.message
                : 'Failed to reject operator',
          })
        } finally {
          setActionLoading(null)
        }
      },
    })
  }

  // const handleStatusChange = async (operator_id: string, newStatus: string) => {
  //   const operator = operators.find((op) => op.operator_id === operator_id)
  //   if (!operator) return

  //   setActionLoading(operator_id)
  //   try {
  //     if (newStatus === 'approved' && operator.status !== 'approved') {
  //       await approveOperator(operator_id, 'Status updated via admin panel')
  //     } else if (newStatus === 'rejected' && operator.status !== 'rejected') {
  //       await rejectOperator(operator_id, 'Status updated via admin panel')
  //     } else if (newStatus === 'suspended' && operator.status !== 'suspended') {
  //       await suspendOperator(operator_id, 'Status updated via admin panel')
  //     } else if (newStatus === 'pending' && operator.status !== 'pending') {
  //       await activateOperator(operator_id)
  //     }
  //     setShowFormDrawer(false)
  //     setEditingOperator(null)
  //   } finally {
  //     setActionLoading(null)
  //   }
  // }

  const handleSuspendOperator = async (operator_id: string) => {
    const operator = operators.find((op) => op.operator_id === operator_id)
    if (!operator) return

    setReasonModal({
      open: true,
      title: 'Suspend Operator',
      action: 'suspend',
      onConfirm: async (reason: string) => {
        setActionLoading(operator_id)
        try {
          await suspendOperator(operator_id, reason)
          setReasonModal({
            open: false,
            title: '',
            action: 'suspend',
            onConfirm: () => {},
          })
        } catch (error) {
          setErrorModal({
            open: true,
            title: 'Suspension Failed',
            message:
              error instanceof Error
                ? error.message
                : 'Failed to suspend operator',
          })
        } finally {
          setActionLoading(null)
        }
      },
    })
  }

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && pagination && newPage <= pagination.totalPages) {
      setCurrentPage(newPage)
    }
  }

  const handleActivateOperator = async (operator_id: string) => {
    const operator = operators.find((op) => op.operator_id === operator_id)
    if (!operator) return

    setConfirmDialog({
      open: true,
      title: 'Activate Operator',
      message: `Are you sure you want to activate ${operator.name}? They will regain access to the platform.`,
      onConfirm: async () => {
        setActionLoading(operator_id)
        try {
          await activateOperator(operator_id)
          setConfirmDialog({
            open: false,
            title: '',
            message: '',
            onConfirm: () => {},
          })
        } catch (error) {
          setErrorModal({
            open: true,
            title: 'Activation Failed',
            message:
              error instanceof Error
                ? error.message
                : 'Failed to activate operator',
          })
        } finally {
          setActionLoading(null)
        }
      },
    })
  }

  const toggleExpand = async (operatorId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(operatorId)) {
      newExpanded.delete(operatorId)
    } else {
      newExpanded.add(operatorId)
      // Fetch analytics if not already fetched
      if (!operatorAnalytics[operatorId]) {
        setAnalyticsLoading((prev) => new Set(prev).add(operatorId))
        try {
          const analytics = await fetchOperatorAnalytics(operatorId)
          setOperatorAnalytics((prev) => ({ ...prev, [operatorId]: analytics }))
        } finally {
          setAnalyticsLoading((prev) => {
            const newSet = new Set(prev)
            newSet.delete(operatorId)
            return newSet
          })
        }
      }
    }
    setExpandedRows(newExpanded)
  }

  if (isLoading && operators.length === 0) {
    return (
      <DashboardLayout>
        <AdminLoadingSpinner />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Operator Management
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage bus operators and their platform access
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <SearchInput
            placeholder="Search operators..."
            value={searchTerm}
            onChange={setSearchTerm}
            className="flex-1"
          />
          <CustomDropdown
            options={[
              { id: 'ALL', label: 'All Status' },
              { id: 'PENDING', label: 'Pending' },
              { id: 'APPROVED', label: 'Approved' },
              { id: 'SUSPENDED', label: 'Suspended' },
              { id: 'REJECTED', label: 'Rejected' },
            ]}
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value)
              setCurrentPage(1) // Reset to first page when filter changes
            }}
            placeholder="Select status"
          />
        </div>

        {/* Operators List */}
        <div className="bg-card rounded-lg border border-border overflow-hidden max-w-full">
          <AdminTable
            columns={[
              { key: 'operator', label: 'Operator' },
              { key: 'contact', label: 'Contact' },
              { key: 'status', label: 'Status' },
              { key: 'rating', label: 'Rating' },
              { key: 'created', label: 'Created' },
              { key: 'actions', label: 'Actions', align: 'right' },
            ]}
          >
            {paginatedOperators.map((operator) => (
              <>
                <AdminTableRow key={operator.operator_id}>
                  <AdminTableCell>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleExpand(operator.operator_id)}
                        className="text-primary hover:text-primary/80"
                        title={
                          expandedRows.has(operator.operator_id)
                            ? 'Collapse'
                            : 'Expand'
                        }
                      >
                        {expandedRows.has(operator.operator_id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {operator.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ID: {operator.operator_id}
                        </div>
                      </div>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <div className="text-sm text-muted-foreground">
                      {operator.contact_email}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {operator.contact_phone}
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <StatusBadge {...getStatusBadgeProps(operator.status)} />
                  </AdminTableCell>
                  <AdminTableCell>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">
                        <div>⭐ {operator.rating.toFixed(1)}</div>
                        <div className="text-muted-foreground">
                          {operator.rating_count} ratings
                        </div>
                      </div>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    {new Date(operator.created_at || '').toLocaleDateString()}
                  </AdminTableCell>
                  <AdminTableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() =>
                          setShowDetails(
                            showDetails === operator.operator_id
                              ? null
                              : operator.operator_id
                          )
                        }
                        className="text-primary hover:text-primary/80 disabled:opacity-50"
                        title="View Details"
                        disabled={actionLoading === operator.operator_id}
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {operator.status === 'pending' && (
                        <>
                          <button
                            onClick={() =>
                              handleApproveOperator(operator.operator_id)
                            }
                            className="text-green-600 hover:text-green-800 disabled:opacity-50"
                            title="Approve"
                            disabled={actionLoading === operator.operator_id}
                          >
                            {actionLoading === operator.operator_id ? (
                              <AdminLoadingSpinner />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() =>
                              handleRejectOperator(operator.operator_id)
                            }
                            className="text-red-600 hover:text-red-800 disabled:opacity-50"
                            title="Reject"
                            disabled={actionLoading === operator.operator_id}
                          >
                            {actionLoading === operator.operator_id ? (
                              <AdminLoadingSpinner />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                          </button>
                        </>
                      )}

                      {operator.status === 'approved' && (
                        <button
                          onClick={() =>
                            handleSuspendOperator(operator.operator_id)
                          }
                          className="text-orange-600 hover:text-orange-800 disabled:opacity-50"
                          title="Suspend"
                          disabled={actionLoading === operator.operator_id}
                        >
                          {actionLoading === operator.operator_id ? (
                            <AdminLoadingSpinner />
                          ) : (
                            <UserX className="h-4 w-4" />
                          )}
                        </button>
                      )}

                      {operator.status === 'suspended' && (
                        <button
                          onClick={() =>
                            handleActivateOperator(operator.operator_id)
                          }
                          className="text-green-600 hover:text-green-800 disabled:opacity-50"
                          title="Activate"
                          disabled={actionLoading === operator.operator_id}
                        >
                          {actionLoading === operator.operator_id ? (
                            <AdminLoadingSpinner />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </AdminTableCell>
                </AdminTableRow>
                {expandedRows.has(operator.operator_id) && (
                  <AdminTableRow key={`${operator.operator_id}-expanded`}>
                    <AdminTableCell colSpan={6} className="bg-muted/50">
                      <div className="p-4">
                        <h4 className="font-semibold mb-3">
                          Performance Metrics
                        </h4>
                        {analyticsLoading.has(operator.operator_id) ? (
                          <div className="flex items-center gap-2">
                            <AdminLoadingSpinner />
                            <span className="text-sm text-muted-foreground">
                              Loading metrics...
                            </span>
                          </div>
                        ) : operatorAnalytics[operator.operator_id] ? (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-card p-3 rounded border">
                              <div className="text-sm text-muted-foreground">
                                Total Trips
                              </div>
                              <div className="text-lg font-semibold">
                                {
                                  operatorAnalytics[operator.operator_id]
                                    .totalTrips
                                }
                              </div>
                            </div>
                            <div className="bg-card p-3 rounded border">
                              <div className="text-sm text-muted-foreground">
                                Completed Trips
                              </div>
                              <div className="text-lg font-semibold">
                                {
                                  operatorAnalytics[operator.operator_id]
                                    .completedTrips
                                }
                              </div>
                            </div>
                            <div className="bg-card p-3 rounded border">
                              <div className="text-sm text-muted-foreground">
                                Total Revenue
                              </div>
                              <div className="text-lg font-semibold">
                                $
                                {operatorAnalytics[
                                  operator.operator_id
                                ].totalRevenue.toFixed(2)}
                              </div>
                            </div>
                            <div className="bg-card p-3 rounded border">
                              <div className="text-sm text-muted-foreground">
                                Avg Rating
                              </div>
                              <div className="text-lg font-semibold">
                                {operatorAnalytics[
                                  operator.operator_id
                                ].rating.toFixed(1)}{' '}
                                ⭐
                              </div>
                            </div>
                            <div className="bg-card p-3 rounded border">
                              <div className="text-sm text-muted-foreground">
                                Total Bookings
                              </div>
                              <div className="text-lg font-semibold">
                                {
                                  operatorAnalytics[operator.operator_id]
                                    .totalBookings
                                }
                              </div>
                            </div>
                            <div className="bg-card p-3 rounded border">
                              <div className="text-sm text-muted-foreground">
                                Avg Occupancy
                              </div>
                              <div className="text-lg font-semibold">
                                {operatorAnalytics[
                                  operator.operator_id
                                ].avgOccupancy.toFixed(1)}
                                %
                              </div>
                            </div>
                            <div className="bg-card p-3 rounded border">
                              <div className="text-sm text-muted-foreground">
                                Total Routes
                              </div>
                              <div className="text-lg font-semibold">
                                {
                                  operatorAnalytics[operator.operator_id]
                                    .totalRoutes
                                }
                              </div>
                            </div>
                            <div className="bg-card p-3 rounded border">
                              <div className="text-sm text-muted-foreground">
                                Total Buses
                              </div>
                              <div className="text-lg font-semibold">
                                {
                                  operatorAnalytics[operator.operator_id]
                                    .totalBuses
                                }
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            Failed to load metrics
                          </div>
                        )}
                      </div>
                    </AdminTableCell>
                  </AdminTableRow>
                )}
              </>
            ))}
          </AdminTable>
        </div>
        {/* Empty State */}
        {paginatedOperators.length === 0 && (
          <AdminEmptyState
            icon={Users}
            title="No operators found"
            description="There are no operators matching your current filters."
          />
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog
          open={confirmDialog.open}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onClose={() =>
            setConfirmDialog({
              open: false,
              title: '',
              message: '',
              onConfirm: () => {},
            })
          }
          confirmText={confirmDialog.confirmText}
          cancelText={confirmDialog.cancelText}
        />

        {/* Error Modal */}
        <ErrorModal
          open={errorModal.open}
          title={errorModal.title}
          message={errorModal.message}
          onClose={() => setErrorModal({ open: false, title: '', message: '' })}
        />

        {/* Reason Modal */}
        <ReasonModal
          open={reasonModal.open}
          title={reasonModal.title}
          action={reasonModal.action}
          onConfirm={reasonModal.onConfirm}
          onClose={() =>
            setReasonModal({
              open: false,
              title: '',
              action: 'suspend',
              onConfirm: () => {},
            })
          }
        />

        {/* Operator Details Modal */}
        {/* Operator Details Drawer */}
        <OperatorDetailsDrawer
          open={showDetails !== null}
          onClose={() => setShowDetails(null)}
          operator={
            operators.find((op) => op.operator_id === showDetails) || null
          }
        />

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center">
            <AdminTablePagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              onPageChange={handlePageChange}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default AdminOperatorManagement
