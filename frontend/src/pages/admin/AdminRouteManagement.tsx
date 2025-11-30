import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/admin/DashboardLayout'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MapPin,
  Loader,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from 'lucide-react'
import { useAdminRoutes, type RouteData } from '@/hooks/admin/useAdminRoutes'
import { useToast } from '@/hooks/use-toast'
import { CustomDropdown } from '@/components/ui/custom-dropdown'

// Fallback mock data when API is unavailable
const MOCK_ROUTES: RouteData[] = [
  {
    routeId: '1',
    origin: 'Ho Chi Minh City',
    destination: 'Da Nang',
    distanceKm: 850,
    estimatedMinutes: 720,
    pickupPoints: ['Ben Thanh Market', 'Pham Ngu Lao', 'Tan Son Nhat Airport'],
    dropoffPoints: ['Da Nang Airport', 'Son Tra Peninsula', 'Marble Mountains'],
    status: 'active',
    createdAt: '2025-01-15T10:30:00Z',
  },
  {
    routeId: '2',
    origin: 'Hanoi',
    destination: 'Ho Chi Minh City',
    distanceKm: 1700,
    estimatedMinutes: 1800,
    pickupPoints: ['Old Quarter', 'Noi Bai Airport', 'Ha Dong'],
    dropoffPoints: ['Tan Son Nhat Airport', 'Ben Thanh Market', 'Cu Chi'],
    status: 'active',
    createdAt: '2025-01-16T14:20:00Z',
  },
  {
    routeId: '3',
    origin: 'Can Tho',
    destination: 'Ho Chi Minh City',
    distanceKm: 180,
    estimatedMinutes: 240,
    pickupPoints: ['Can Tho Central Bus Station', 'Can Tho Airport'],
    dropoffPoints: ['Ben Thanh Market', 'Tan Son Nhat Airport'],
    status: 'active',
    createdAt: '2025-01-17T09:15:00Z',
  },
  {
    routeId: '4',
    origin: 'Da Lat',
    destination: 'Ho Chi Minh City',
    distanceKm: 305,
    estimatedMinutes: 480,
    pickupPoints: ['Da Lat Bus Station', 'Flower Park'],
    dropoffPoints: ['Ben Thanh Market'],
    status: 'inactive',
    createdAt: '2025-01-18T11:45:00Z',
  },
  {
    routeId: '5',
    origin: 'Nha Trang',
    destination: 'Da Nang',
    distanceKm: 520,
    estimatedMinutes: 600,
    pickupPoints: ['Nha Trang Bus Station', 'Nha Trang Airport'],
    dropoffPoints: ['Da Nang Airport', 'Da Nang Bus Station'],
    status: 'active',
    createdAt: '2025-01-19T16:00:00Z',
  },
]

const AdminRouteManagement: React.FC = () => {
  const {
    routes: apiRoutes,
    isLoading,
    fetchRoutes,
    createRoute,
    updateRoute,
    deleteRoute,
  } = useAdminRoutes()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all')
  const [distanceFilter, setDistanceFilter] = useState<
    'ALL' | 'SHORT' | 'MEDIUM' | 'LONG'
  >('ALL')
  const [showForm, setShowForm] = useState(false)
  const [editingRoute, setEditingRoute] = useState<RouteData | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [useMockData, setUseMockData] = useState(false)
  const ROUTES_PER_PAGE = 10

  // Use mock data if API fails
  const routes = useMockData ? MOCK_ROUTES : apiRoutes

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        await fetchRoutes(currentPage, ROUTES_PER_PAGE, searchTerm)
        setUseMockData(false)
      } catch {
        // Fall back to mock data on error
        setUseMockData(true)
        toast({
          title: 'API Unavailable',
          description: 'Using demo data. Showing example routes.',
        })
      }
    }
    loadRoutes()
  }, [currentPage, searchTerm, fetchRoutes, toast])

  // Filter routes based on all criteria
  const filteredRoutes = routes.filter((route) => {
    // Search filter
    const matchesSearch =
      route.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.destination.toLowerCase().includes(searchTerm.toLowerCase())

    // Status filter
    const matchesStatus =
      statusFilter === 'all' || route.status === statusFilter

    // Distance filter
    let matchesDistance = true
    if (distanceFilter === 'SHORT') {
      matchesDistance = route.distanceKm <= 300
    } else if (distanceFilter === 'MEDIUM') {
      matchesDistance = route.distanceKm > 300 && route.distanceKm <= 800
    } else if (distanceFilter === 'LONG') {
      matchesDistance = route.distanceKm > 800
    }

    return matchesSearch && matchesStatus && matchesDistance
  })

  // Paginate filtered results
  const paginatedRoutes = filteredRoutes.slice(
    (currentPage - 1) * ROUTES_PER_PAGE,
    currentPage * ROUTES_PER_PAGE
  )
  const calculatedTotalPages = Math.ceil(
    filteredRoutes.length / ROUTES_PER_PAGE
  )

  const handleCreateRoute = () => {
    setEditingRoute(null)
    setShowForm(true)
  }

  const handleEditRoute = (route: RouteData) => {
    setEditingRoute(route)
    setShowForm(true)
  }

  const handleDeleteRoute = async (routeId: string, routeName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${routeName}"? This action cannot be undone.`
      )
    ) {
      return
    }

    setActionLoading(routeId)
    try {
      await deleteRoute(routeId)
      setCurrentPage(1)
    } catch {
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete route',
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleSaveRoute = async (routeData: Omit<RouteData, 'routeId'>) => {
    try {
      if (editingRoute?.routeId) {
        await updateRoute(editingRoute.routeId, routeData)
      } else {
        await createRoute(routeData)
      }
      setShowForm(false)
      setCurrentPage(1)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save route',
      })
    }
  }

  const resetFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setDistanceFilter('ALL')
    setCurrentPage(1)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Route Management
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Create and manage bus routes for trip scheduling
            </p>
          </div>
          <button
            onClick={handleCreateRoute}
            className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Route
          </button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search by origin or destination..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Status
              </label>
              <CustomDropdown
                options={[
                  { id: 'all', label: 'All Status' },
                  { id: 'active', label: 'Active' },
                  { id: 'inactive', label: 'Inactive' },
                ]}
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value as 'all' | 'active' | 'inactive')
                  setCurrentPage(1)
                }}
                placeholder="Select Status"
              />
            </div>

            {/* Distance Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Distance
              </label>
              <CustomDropdown
                options={[
                  { id: 'ALL', label: 'All Distances' },
                  { id: 'SHORT', label: 'Short (≤ 300 km)' },
                  { id: 'MEDIUM', label: 'Medium (301-800 km)' },
                  { id: 'LONG', label: `Long (>800 km)` },
                ]}
                value={distanceFilter}
                onChange={(value) => {
                  setDistanceFilter(
                    value as 'ALL' | 'SHORT' | 'MEDIUM' | 'LONG'
                  )
                  setCurrentPage(1)
                }}
                placeholder="Select Distance"
              />
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                disabled={
                  !searchTerm &&
                  statusFilter === 'all' &&
                  distanceFilter === 'ALL'
                }
                className="w-full px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Active Filters Info */}
          {(searchTerm ||
            statusFilter !== 'all' ||
            distanceFilter !== 'ALL') && (
            <div className="text-sm text-muted-foreground">
              Showing {filteredRoutes.length} of {routes.length} routes
              {searchTerm && ` • Search: "${searchTerm}"`}
              {statusFilter !== 'all' && ` • Status: ${statusFilter}`}
              {distanceFilter !== 'ALL' && ` • Distance: ${distanceFilter}`}
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && !routes.length && !useMockData ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : filteredRoutes.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium text-foreground">
              No routes found
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchTerm || statusFilter !== 'all' || distanceFilter !== 'ALL'
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first route to get started'}
            </p>
            {(searchTerm ||
              statusFilter !== 'all' ||
              distanceFilter !== 'ALL') && (
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Routes List */}
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Route
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Distance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Pickup Points
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {paginatedRoutes.map((route) => (
                      <tr key={route.routeId} className="hover:bg-muted/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">
                              {route.origin}
                            </span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">
                              {route.destination}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {route.distanceKm} km
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {Math.floor(route.estimatedMinutes / 60)}h{' '}
                          {route.estimatedMinutes % 60}m
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          <div className="max-w-xs truncate">
                            {route.pickupPoints?.join(', ') || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                            style={{
                              backgroundColor:
                                route.status === 'active'
                                  ? 'color-mix(in srgb, var(--success) 20%, transparent)'
                                  : 'color-mix(in srgb, var(--muted) 20%, transparent)',
                              color:
                                route.status === 'active'
                                  ? 'var(--success)'
                                  : 'var(--muted-foreground)',
                            }}
                          >
                            {route.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleEditRoute(route)}
                            disabled={actionLoading === route.routeId}
                            className="inline-flex items-center text-primary hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteRoute(
                                route.routeId!,
                                `${route.origin} → ${route.destination}`
                              )
                            }
                            disabled={actionLoading === route.routeId}
                            className="inline-flex items-center text-destructive hover:text-destructive/80 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading === route.routeId ? (
                              <Loader className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {calculatedTotalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="inline-flex items-center rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, calculatedTotalPages)
                    )
                  }
                  disabled={currentPage === calculatedTotalPages}
                  className="inline-flex items-center rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          </>
        )}

        {/* Route Form Modal */}
        {showForm && (
          <RouteFormModal
            route={editingRoute}
            onSave={handleSaveRoute}
            onClose={() => setShowForm(false)}
          />
        )}
      </div>
    </DashboardLayout>
  )
}

// Route Form Modal Component
interface RouteFormModalProps {
  route?: RouteData | null
  onSave: (route: Omit<RouteData, 'routeId'>) => void
  onClose: () => void
}

const RouteFormModal: React.FC<RouteFormModalProps> = ({
  route,
  onSave,
  onClose,
}) => {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    origin: route?.origin || '',
    destination: route?.destination || '',
    distanceKm: route?.distanceKm || '',
    estimatedMinutes: route?.estimatedMinutes || '',
    pickupPoints: route?.pickupPoints || [''],
    dropoffPoints: route?.dropoffPoints || [''],
    status: route?.status || ('active' as const),
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Basic validation
    if (
      !formData.origin ||
      !formData.destination ||
      !formData.distanceKm ||
      !formData.estimatedMinutes
    ) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
      })
      return
    }

    if (formData.pickupPoints.filter((p) => p.trim()).length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please add at least one pickup point',
      })
      return
    }

    if (formData.dropoffPoints.filter((p) => p.trim()).length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please add at least one dropoff point',
      })
      return
    }

    setIsSubmitting(true)
    try {
      await onSave({
        origin: formData.origin,
        destination: formData.destination,
        distanceKm: Number(formData.distanceKm),
        estimatedMinutes: Number(formData.estimatedMinutes),
        pickupPoints: formData.pickupPoints.filter((p) => p.trim()),
        dropoffPoints: formData.dropoffPoints.filter((p) => p.trim()),
        status: formData.status,
      })
    } catch (err) {
      // Error already handled by parent component
      console.error('Form submission error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addPoint = (type: 'pickup' | 'dropoff') => {
    setFormData((prev) => ({
      ...prev,
      [type === 'pickup' ? 'pickupPoints' : 'dropoffPoints']: [
        ...prev[type === 'pickup' ? 'pickupPoints' : 'dropoffPoints'],
        '',
      ],
    }))
  }

  const updatePoint = (
    type: 'pickup' | 'dropoff',
    index: number,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [type === 'pickup' ? 'pickupPoints' : 'dropoffPoints']: prev[
        type === 'pickup' ? 'pickupPoints' : 'dropoffPoints'
      ].map((point, i) => (i === index ? value : point)),
    }))
  }

  const removePoint = (type: 'pickup' | 'dropoff', index: number) => {
    setFormData((prev) => ({
      ...prev,
      [type === 'pickup' ? 'pickupPoints' : 'dropoffPoints']: prev[
        type === 'pickup' ? 'pickupPoints' : 'dropoffPoints'
      ].filter((_, i) => i !== index),
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4 text-foreground">
          {route ? 'Edit Route' : 'Add New Route'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                From *
              </label>
              <input
                type="text"
                value={formData.origin}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, origin: e.target.value }))
                }
                className="w-full px-3 py-2 border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Origin city"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                To *
              </label>
              <input
                type="text"
                value={formData.destination}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    destination: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Destination city"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Distance (km) *
              </label>
              <input
                type="number"
                value={formData.distanceKm}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    distanceKm: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g., 850"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Duration (minutes) *
              </label>
              <input
                type="number"
                value={formData.estimatedMinutes}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    estimatedMinutes: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g., 720"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Pickup Points
            </label>
            {formData.pickupPoints.map((point, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={point}
                  onChange={(e) => updatePoint('pickup', index, e.target.value)}
                  placeholder="Enter pickup point"
                  className="flex-1 px-3 py-2 border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {formData.pickupPoints.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePoint('pickup', index)}
                    className="px-3 py-2 text-destructive hover:bg-destructive/10 rounded-md transition"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addPoint('pickup')}
              className="text-primary hover:text-primary/80 text-sm font-medium"
            >
              + Add pickup point
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Dropoff Points
            </label>
            {formData.dropoffPoints.map((point, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={point}
                  onChange={(e) =>
                    updatePoint('dropoff', index, e.target.value)
                  }
                  placeholder="Enter dropoff point"
                  className="flex-1 px-3 py-2 border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {formData.dropoffPoints.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePoint('dropoff', index)}
                    className="px-3 py-2 text-destructive hover:bg-destructive/10 rounded-md transition"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addPoint('dropoff')}
              className="text-primary hover:text-primary/80 text-sm font-medium"
            >
              + Add dropoff point
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  status: e.target.value as 'active' | 'inactive',
                }))
              }
              className="w-full px-3 py-2 border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {isSubmitting && <Loader className="h-4 w-4 animate-spin" />}
              {route ? 'Update Route' : 'Create Route'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminRouteManagement
