import React, { useState } from 'react'
import {
  type Trip,
  type Route,
  type Bus,
  type TripFormData,
} from '../../types/trip.types'
import '@/styles/admin.css'
import { DashboardLayout } from '@/components/admin/DashboardLayout'
import { TripFilters } from '@/components/admin/TripFilters'
import { TripList } from '@/components/admin/TripList'
import { TripCalendarView } from '@/components/admin/TripCalendarView'
import { TripTableView } from '@/components/admin/TripTableView'
import { TripFormDrawer } from '@/components/admin/TripFormDrawer'
import { CustomDatePicker } from '@/components/ui/custom-datepicker'

// ============================================================================
// MOCK DATA
// ============================================================================

const initialRoutes: Route[] = [
  {
    id: 'r1',
    from: 'Ho Chi Minh City',
    to: 'Da Lat',
    distance: 0,
    estimatedDuration: 0,
    pickupPoints: [],
    dropoffPoints: [],
    status: 'INACTIVE',
  },
  {
    id: 'r2',
    from: 'Ho Chi Minh City',
    to: 'Nha Trang',
    distance: 0,
    estimatedDuration: 0,
    pickupPoints: [],
    dropoffPoints: [],
    status: 'INACTIVE',
  },
]

const initialBuses: Bus[] = [
  {
    id: 'b1',
    name: 'Limousine 20-seat',
    type: 'LIMOUSINE',
    capacity: 20,
    model: '',
    plateNumber: '',
    amenities: [],
    status: 'INACTIVE',
  },
  {
    id: 'b2',
    name: 'Sleeper 40-seat',
    type: 'SLEEPER',
    capacity: 40,
    model: '',
    plateNumber: '',
    amenities: [],
    status: 'INACTIVE',
  },
]

// Trips data structure reflecting GET /trips/search response format from API
const initialTrips: Trip[] = [
  {
    tripId: 'trp_xyz789',
    route: {
      routeId: 'r1',
      origin: 'Ho Chi Minh City',
      destination: 'Da Lat',
      distanceKm: 308,
      estimatedMinutes: 360,
    },
    operator: {
      operatorId: 'opr_futa',
      name: 'Futa Bus Lines',
      rating: 4.5,
      logo: 'https://cdn.example.com/futa-logo.png',
    },
    bus: {
      busId: 'b1',
      model: 'Limousine 20-seat',
      plateNumber: '51B-12345',
      seatCapacity: 20,
      busType: 'LIMOUSINE',
      amenities: ['wifi', 'ac', 'toilet', 'entertainment'],
    },
    schedule: {
      departureTime: '2025-11-30T08:00:00Z',
      arrivalTime: '2025-11-30T12:30:00Z',
      duration: 270,
    },
    pricing: {
      basePrice: 350000,
      currency: 'VND',
      serviceFee: 10000,
    },
    availability: {
      totalSeats: 20,
      availableSeats: 8,
      occupancyRate: 60,
    },
    policies: {
      cancellationPolicy: 'free cancellation up to 24 hours before departure',
      modificationPolicy: 'modification allowed up to 12 hours before',
      refundPolicy: '80% refund if cancelled 24h+ before departure',
    },
    pickupPoints: [
      {
        pointId: 'pp_001',
        name: 'Ben Xe Mien Dong',
        address: '292 Dinh Bo Linh, Binh Thanh, HCM',
        time: '2025-11-30T08:00:00Z',
      },
    ],
    dropoffPoints: [
      {
        pointId: 'dp_001',
        name: 'Ben Xe My Dinh',
        address: 'Pham Hung, Nam Tu Liem, Hanoi',
        time: '2025-11-30T12:30:00Z',
      },
    ],
    status: 'active',
  },
  {
    tripId: 'trp_abc123',
    route: {
      routeId: 'r1',
      origin: 'Ho Chi Minh City',
      destination: 'Da Lat',
      distanceKm: 308,
      estimatedMinutes: 360,
    },
    operator: {
      operatorId: 'opr_futa',
      name: 'Futa Bus Lines',
      rating: 4.5,
      logo: 'https://cdn.example.com/futa-logo.png',
    },
    bus: {
      busId: 'b2',
      model: 'Sleeper 40-seat',
      plateNumber: '51B-67890',
      seatCapacity: 40,
      busType: 'SLEEPER',
      amenities: ['wifi', 'ac', 'toilet', 'entertainment', 'bed'],
    },
    schedule: {
      departureTime: '2025-11-30T14:00:00Z',
      arrivalTime: '2025-11-30T18:15:00Z',
      duration: 255,
    },
    pricing: {
      basePrice: 300000,
      currency: 'VND',
      serviceFee: 10000,
    },
    availability: {
      totalSeats: 40,
      availableSeats: 12,
      occupancyRate: 70,
    },
    policies: {
      cancellationPolicy: 'free cancellation up to 24 hours before departure',
      modificationPolicy: 'modification allowed up to 12 hours before',
      refundPolicy: '80% refund if cancelled 24h+ before departure',
    },
    pickupPoints: [
      {
        pointId: 'pp_002',
        name: 'Ben Xe Mien Dong',
        address: '292 Dinh Bo Linh, Binh Thanh, HCM',
        time: '2025-11-30T14:00:00Z',
      },
    ],
    dropoffPoints: [
      {
        pointId: 'dp_002',
        name: 'Ben Xe My Dinh',
        address: 'Pham Hung, Nam Tu Liem, Hanoi',
        time: '2025-11-30T18:15:00Z',
      },
    ],
    status: 'active',
  },
  {
    tripId: 'trp_def456',
    route: {
      routeId: 'r2',
      origin: 'Ho Chi Minh City',
      destination: 'Nha Trang',
      distanceKm: 441,
      estimatedMinutes: 420,
    },
    operator: {
      operatorId: 'opr_futa',
      name: 'Futa Bus Lines',
      rating: 4.5,
      logo: 'https://cdn.example.com/futa-logo.png',
    },
    bus: {
      busId: 'b1',
      model: 'Limousine 20-seat',
      plateNumber: '51B-12345',
      seatCapacity: 20,
      busType: 'LIMOUSINE',
      amenities: ['wifi', 'ac', 'toilet', 'entertainment'],
    },
    schedule: {
      departureTime:
        new Date(Date.now() + 86400000).toISOString().split('T')[0] +
        'T06:30:00Z',
      arrivalTime:
        new Date(Date.now() + 86400000).toISOString().split('T')[0] +
        'T11:00:00Z',
      duration: 270,
    },
    pricing: {
      basePrice: 400000,
      currency: 'VND',
      serviceFee: 10000,
    },
    availability: {
      totalSeats: 20,
      availableSeats: 5,
      occupancyRate: 75,
    },
    policies: {
      cancellationPolicy: 'free cancellation up to 24 hours before departure',
      modificationPolicy: 'modification allowed up to 12 hours before',
      refundPolicy: '80% refund if cancelled 24h+ before departure',
    },
    pickupPoints: [
      {
        pointId: 'pp_003',
        name: 'Ben Xe Mien Dong',
        address: '292 Dinh Bo Linh, Binh Thanh, HCM',
        time:
          new Date(Date.now() + 86400000).toISOString().split('T')[0] +
          'T06:30:00Z',
      },
    ],
    dropoffPoints: [
      {
        pointId: 'dp_003',
        name: 'Ben Xe My Dinh',
        address: 'Pham Hung, Nam Tu Liem, Hanoi',
        time:
          new Date(Date.now() + 86400000).toISOString().split('T')[0] +
          'T11:00:00Z',
      },
    ],
    status: 'active',
  },
]

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

const AdminTripSchedulingPage: React.FC = () => {
  const [routes] = useState(initialRoutes)
  const [buses] = useState(initialBuses)
  const [trips, setTrips] = useState(initialTrips)
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [viewMode, setViewMode] = useState<'CALENDAR' | 'LIST'>('CALENDAR')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null)

  // Filter state
  const [filters, setFilters] = useState({
    routeId: '',
    busId: '',
    status: '',
  })
  const [appliedFilters, setAppliedFilters] = useState({
    routeId: '',
    busId: '',
    status: '',
  })

  // Bulk operations state
  const [selectedTripIds, setSelectedTripIds] = useState<string[]>([])

  const handleCreateClick = () => {
    setEditingTrip(null)
    setDrawerOpen(true)
  }

  const handleEditTrip = (trip: Trip) => {
    setEditingTrip(trip)
    setDrawerOpen(true)
  }

  // Validation and conflict detection
  const validateTripForm = (form: TripFormData): string[] => {
    const errors: string[] = []

    // Required fields
    if (!form.routeId) errors.push('Route is required')
    if (!form.busId) errors.push('Bus is required')
    if (!form.date) errors.push('Date is required')
    if (!form.departureTime) errors.push('Departure time is required')
    if (!form.arrivalTime) errors.push('Arrival time is required')
    if (!form.basePrice || form.basePrice === '') {
      errors.push('Base price is required')
    }

    // Price validation
    if (form.basePrice && Number(form.basePrice) < 0) {
      errors.push('Base price cannot be negative')
    }

    // Date validation
    if (form.date) {
      const selectedDate = new Date(form.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selectedDate < today) {
        errors.push('Date must be today or in the future')
      }
    }

    // Time validation
    if (form.departureTime && form.arrivalTime) {
      const depTime = form.departureTime
      const arrTime = form.arrivalTime
      if (depTime >= arrTime) {
        errors.push('Arrival time must be after departure time')
      }
    }

    // Recurrence validation
    if (form.isRecurring) {
      if (!form.recurrenceType) {
        errors.push('Recurrence type is required for recurring trips')
      }
      if (!form.recurrenceEndDate) {
        errors.push('End date is required for recurring trips')
      }
      if (
        form.recurrenceType === 'WEEKLY' &&
        form.recurrenceDays.length === 0
      ) {
        errors.push('At least one day must be selected for weekly recurrence')
      }
      if (form.recurrenceEndDate && form.date) {
        const startDate = new Date(form.date)
        const endDate = new Date(form.recurrenceEndDate)
        if (endDate <= startDate) {
          errors.push('End date must be after start date')
        }
      }
    }

    return errors
  }

  const detectConflicts = (
    newTrip: TripFormData,
    existingTrips: Trip[]
  ): string[] => {
    const conflicts: string[] = []
    const selectedBus = buses.find((b) => b.id === newTrip.busId)
    if (!selectedBus) return conflicts

    const newDate = newTrip.date
    const newDepTime = newTrip.departureTime
    const newArrTime = newTrip.arrivalTime

    // Check for same bus conflicts on same date
    const sameBusTrips = existingTrips.filter(
      (t) =>
        t.bus.busId === newTrip.busId &&
        t.schedule.departureTime.split('T')[0] === newDate &&
        t.tripId !== newTrip.id // Exclude current trip when editing
    )

    for (const trip of sameBusTrips) {
      // Check for time overlap
      const tripDepTime = trip.schedule.departureTime.split('T')[1].slice(0, 5)
      const tripArrTime = trip.schedule.arrivalTime.split('T')[1].slice(0, 5)
      const tripRouteLabel = `${trip.route.origin} → ${trip.route.destination}`

      // Two time ranges overlap if: start1 < end2 && start2 < end1
      if (newDepTime < tripArrTime && tripDepTime < newArrTime) {
        conflicts.push(
          `Bus "${selectedBus.name}" has a conflicting trip: ${tripRouteLabel} (${tripDepTime} - ${tripArrTime})`
        )
      }
    }

    return conflicts
  }

  const generateRecurringTrips = (baseTrip: TripFormData): Trip[] => {
    const trips: Trip[] = []
    const startDate = new Date(baseTrip.date)
    const endDate = new Date(baseTrip.recurrenceEndDate!)
    const route = routes.find((r) => r.id === baseTrip.routeId)
    const bus = buses.find((b) => b.id === baseTrip.busId)

    if (!route || !bus) return trips

    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      let shouldCreate = false

      if (baseTrip.recurrenceType === 'DAILY') {
        shouldCreate = true
      } else if (baseTrip.recurrenceType === 'WEEKLY') {
        const dayOfWeek = currentDate.getDay() // 0 = Sunday, 1 = Monday, etc.
        // Convert to our format: 0 = Monday, 6 = Sunday
        const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1
        shouldCreate = baseTrip.recurrenceDays.includes(
          [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
          ][adjustedDay]
        )
      }

      if (shouldCreate) {
        const departureDateTime = `${currentDate.toISOString().slice(0, 10)}T${baseTrip.departureTime}:00`
        const arrivalDateTime = `${currentDate.toISOString().slice(0, 10)}T${baseTrip.arrivalTime}:00`

        // Calculate duration based on times
        const depParts = baseTrip.departureTime.split(':')
        const arrParts = baseTrip.arrivalTime.split(':')
        const depMinutes = parseInt(depParts[0]) * 60 + parseInt(depParts[1])
        const arrMinutes = parseInt(arrParts[0]) * 60 + parseInt(arrParts[1])
        const duration =
          arrMinutes > depMinutes
            ? arrMinutes - depMinutes
            : 1440 + arrMinutes - depMinutes

        const trip: Trip = {
          tripId: crypto.randomUUID(),
          route: {
            routeId: baseTrip.routeId,
            origin: route.from,
            destination: route.to,
            distanceKm: route.distance,
            estimatedMinutes: route.estimatedDuration,
          },
          operator: {
            operatorId: 'opr_default',
            name: 'Default Operator',
            rating: 4.0,
          },
          bus: {
            busId: baseTrip.busId,
            model: bus.model,
            plateNumber: bus.plateNumber,
            seatCapacity: bus.capacity,
            busType: bus.type,
            amenities: bus.amenities,
          },
          schedule: {
            departureTime: departureDateTime,
            arrivalTime: arrivalDateTime,
            duration: duration,
          },
          pricing: {
            basePrice: Number(baseTrip.basePrice),
            currency: 'VND',
          },
          availability: {
            totalSeats: bus.capacity,
            availableSeats: bus.capacity,
            occupancyRate: 0,
          },
          policies: {
            cancellationPolicy:
              'free cancellation up to 24 hours before departure',
            modificationPolicy: 'modification allowed up to 12 hours before',
            refundPolicy: '80% refund if cancelled 24h+ before departure',
          },
          pickupPoints: [
            {
              pointId: 'pp_' + crypto.randomUUID(),
              name: route.pickupPoints[0] || 'Pickup Point',
              address: 'Pickup Address',
              time: departureDateTime,
            },
          ],
          dropoffPoints: [
            {
              pointId: 'dp_' + crypto.randomUUID(),
              name: route.dropoffPoints[0] || 'Dropoff Point',
              address: 'Dropoff Address',
              time: arrivalDateTime,
            },
          ],
          status: baseTrip.status === 'ACTIVE' ? 'active' : 'inactive',
        }
        trips.push(trip)
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return trips
  }

  // Filter and get trips for selected date
  const filteredTrips = trips.filter((trip) => {
    if (selectedDate) {
      const tripDate = new Date(trip.schedule.departureTime)
      const selected = new Date(selectedDate)
      if (tripDate.toDateString() !== selected.toDateString()) return false
    }

    if (appliedFilters.routeId && trip.route.routeId !== appliedFilters.routeId)
      return false
    if (appliedFilters.busId && trip.bus.busId !== appliedFilters.busId)
      return false
    if (
      appliedFilters.status &&
      trip.status !== appliedFilters.status.toLowerCase()
    )
      return false

    return true
  })

  const handleApplyFilters = () => {
    setAppliedFilters(filters)
  }

  const handleClearFilters = () => {
    setFilters({
      routeId: '',
      busId: '',
      status: '',
    })
    setAppliedFilters({
      routeId: '',
      busId: '',
      status: '',
    })
  }

  const handleSaveTrip = (values: TripFormData) => {
    // Validate form
    const validationErrors = validateTripForm(values)
    if (validationErrors.length > 0) {
      alert(`Validation errors:\n${validationErrors.join('\n')}`)
      return
    }

    // Check for conflicts
    const conflicts = detectConflicts(values, trips)
    if (conflicts.length > 0) {
      const proceed = confirm(
        `Scheduling conflicts detected:\n\n${conflicts.join(
          '\n\n'
        )}Do you want to proceed anyway?`
      )
      if (!proceed) return
    }

    if (values.id) {
      // Update existing trip
      setTrips((prev) =>
        prev.map((t) => {
          if (t.tripId === values.id) {
            const route = routes.find((r) => r.id === values.routeId)
            const bus = buses.find((b) => b.id === values.busId)
            if (!route || !bus) return t

            const depParts = values.departureTime.split(':')
            const arrParts = values.arrivalTime.split(':')
            const depMinutes =
              parseInt(depParts[0]) * 60 + parseInt(depParts[1])
            const arrMinutes =
              parseInt(arrParts[0]) * 60 + parseInt(arrParts[1])
            const duration =
              arrMinutes > depMinutes
                ? arrMinutes - depMinutes
                : 1440 + arrMinutes - depMinutes

            return {
              ...t,
              route: {
                routeId: values.routeId,
                origin: route.from,
                destination: route.to,
                distanceKm: route.distance,
                estimatedMinutes: route.estimatedDuration,
              },
              bus: {
                busId: values.busId,
                model: bus.model,
                plateNumber: bus.plateNumber,
                seatCapacity: bus.capacity,
                busType: bus.type,
                amenities: bus.amenities,
              },
              schedule: {
                departureTime: `${values.date}T${values.departureTime}:00`,
                arrivalTime: `${values.date}T${values.arrivalTime}:00`,
                duration: duration,
              },
              pricing: {
                ...t.pricing,
                basePrice: Number(values.basePrice),
              },
              status: values.status === 'ACTIVE' ? 'active' : 'inactive',
            }
          }
          return t
        })
      )
    } else {
      // Create new trip(s)
      if (values.isRecurring) {
        // Generate recurring trips
        const recurringTrips = generateRecurringTrips(values)
        if (recurringTrips.length > 0) {
          setTrips((prev) => [...prev, ...recurringTrips])
          alert(
            `Created ${recurringTrips.length} recurring trips successfully!`
          )
        }
      } else {
        // Create single trip
        const route = routes.find((r) => r.id === values.routeId)
        const bus = buses.find((b) => b.id === values.busId)
        if (!route || !bus) return

        const depParts = values.departureTime.split(':')
        const arrParts = values.arrivalTime.split(':')
        const depMinutes = parseInt(depParts[0]) * 60 + parseInt(depParts[1])
        const arrMinutes = parseInt(arrParts[0]) * 60 + parseInt(arrParts[1])
        const duration =
          arrMinutes > depMinutes
            ? arrMinutes - depMinutes
            : 1440 + arrMinutes - depMinutes

        const newTrip: Trip = {
          tripId: crypto.randomUUID(),
          route: {
            routeId: values.routeId,
            origin: route.from,
            destination: route.to,
            distanceKm: route.distance,
            estimatedMinutes: route.estimatedDuration,
          },
          operator: {
            operatorId: 'opr_default',
            name: 'Default Operator',
            rating: 4.0,
          },
          bus: {
            busId: values.busId,
            model: bus.model,
            plateNumber: bus.plateNumber,
            seatCapacity: bus.capacity,
            busType: bus.type,
            amenities: bus.amenities,
          },
          schedule: {
            departureTime: `${values.date}T${values.departureTime}:00`,
            arrivalTime: `${values.date}T${values.arrivalTime}:00`,
            duration: duration,
          },
          pricing: {
            basePrice: Number(values.basePrice),
            currency: 'VND',
          },
          availability: {
            totalSeats: bus.capacity,
            availableSeats: bus.capacity,
            occupancyRate: 0,
          },
          policies: {
            cancellationPolicy:
              'free cancellation up to 24 hours before departure',
            modificationPolicy: 'modification allowed up to 12 hours before',
            refundPolicy: '80% refund if cancelled 24h+ before departure',
          },
          pickupPoints: [
            {
              pointId: 'pp_' + crypto.randomUUID(),
              name: route.pickupPoints[0] || 'Pickup Point',
              address: 'Pickup Address',
              time: `${values.date}T${values.departureTime}:00`,
            },
          ],
          dropoffPoints: [
            {
              pointId: 'dp_' + crypto.randomUUID(),
              name: route.dropoffPoints[0] || 'Dropoff Point',
              address: 'Dropoff Address',
              time: `${values.date}T${values.arrivalTime}:00`,
            },
          ],
          status: values.status === 'ACTIVE' ? 'active' : 'inactive',
        }
        setTrips((prev) => [...prev, newTrip])
      }
    }
    setDrawerOpen(false)
  }

  // Bulk operations
  const handleSelectTrip = (tripId: string, selected: boolean) => {
    if (selected) {
      setSelectedTripIds((prev) => [...prev, tripId])
    } else {
      setSelectedTripIds((prev) => prev.filter((id) => id !== tripId))
    }
  }

  const handleSelectAllTrips = (selected: boolean) => {
    if (selected) {
      setSelectedTripIds(filteredTrips.map((trip) => trip.tripId))
    } else {
      setSelectedTripIds([])
    }
  }

  const handleBulkDelete = () => {
    if (selectedTripIds.length === 0) return

    const confirmDelete = confirm(
      `Are you sure you want to delete ${selectedTripIds.length} trip(s)? This action cannot be undone.`
    )

    if (confirmDelete) {
      setTrips((prev) =>
        prev.filter((trip) => !selectedTripIds.includes(trip.tripId))
      )
      setSelectedTripIds([])
    }
  }

  const handleBulkStatusUpdate = (newStatus: 'ACTIVE' | 'INACTIVE') => {
    if (selectedTripIds.length === 0) return

    const statusValue = newStatus === 'ACTIVE' ? 'active' : 'inactive'
    setTrips((prev) =>
      prev.map((trip) =>
        selectedTripIds.includes(trip.tripId)
          ? { ...trip, status: statusValue }
          : trip
      )
    )
    setSelectedTripIds([])
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ color: 'var(--foreground)' }}
          >
            Trip Scheduling
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Create, edit, and manage trip schedules for all routes and buses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <CustomDatePicker
            selected={selectedDate}
            onChange={(date: Date | null) => setSelectedDate(date)}
            dateFormat="EEEE, MMMM d, yyyy"
            placeholderText="Select date"
            className="w-64"
          />
          <button
            onClick={handleCreateClick}
            className="inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                'color-mix(in srgb, var(--primary) 90%, black)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary)'
            }}
          >
            + Create Trip
          </button>
        </div>
      </div>

      {/* Bulk Operations Bar */}
      {selectedTripIds.length > 0 && (
        <div
          className="mb-6 rounded-xl p-4 shadow-sm"
          style={{
            border: '1px solid var(--border)',
            backgroundColor: 'var(--card)',
          }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span
                className="text-sm font-medium"
                style={{ color: 'var(--foreground)' }}
              >
                {selectedTripIds.length} trip
                {selectedTripIds.length !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={() => setSelectedTripIds([])}
                className="text-sm underline focus:outline-none focus:ring-2 focus:ring-offset-2 rounded px-2 py-1"
                style={{
                  color: 'var(--muted-foreground)',
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--foreground)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--muted-foreground)'
                }}
              >
                Clear selection
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                onClick={() => handleBulkStatusUpdate('ACTIVE')}
                className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 min-w-0"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    'color-mix(in srgb, var(--primary) 90%, black)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary)'
                }}
              >
                Activate
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('INACTIVE')}
                className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 min-w-0"
                style={{
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--card)',
                  color: 'var(--foreground)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--muted)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--card)'
                }}
              >
                Deactivate
              </button>
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 min-w-0"
                style={{
                  backgroundColor: 'var(--muted)',
                  color: 'var(--muted-foreground)',
                  border: '1px solid var(--border)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--accent)'
                  e.currentTarget.style.color = 'var(--accent-foreground)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--muted)'
                  e.currentTarget.style.color = 'var(--muted-foreground)'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-[420px,1fr] gap-8">
        {/* Left: Filters + Trip List */}
        <div className="space-y-6">
          <TripFilters
            routes={routes}
            buses={buses}
            filters={filters}
            onFiltersChange={setFilters}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
          />
          <TripList
            trips={filteredTrips}
            onEditTrip={handleEditTrip}
            selectedTripIds={selectedTripIds}
            onSelectTrip={handleSelectTrip}
            onSelectAll={handleSelectAllTrips}
          />
        </div>

        {/* Right: Calendar / List View */}
        <div
          className="flex h-full flex-col rounded-2xl p-6 shadow-sm"
          style={{
            border: '1px solid var(--border)',
            backgroundColor: 'var(--card)',
          }}
        >
          <div className="mb-6 flex items-center justify-between">
            <div
              className="inline-flex rounded-full p-1"
              style={{
                border: '1px solid var(--border)',
                backgroundColor: 'var(--muted)',
              }}
            >
              <button
                className={`rounded-full px-4 py-2 transition ${
                  viewMode === 'CALENDAR' ? 'shadow-sm' : ''
                }`}
                style={{
                  backgroundColor:
                    viewMode === 'CALENDAR' ? 'var(--card)' : 'transparent',

                  color:
                    viewMode === 'CALENDAR'
                      ? 'var(--foreground)'
                      : 'var(--muted-foreground)',
                }}
                onClick={() => setViewMode('CALENDAR')}
              >
                Calendar
              </button>
              <button
                className={`rounded-full px-4 py-2 transition ${
                  viewMode === 'LIST' ? 'shadow-sm' : ''
                }`}
                style={{
                  backgroundColor:
                    viewMode === 'LIST' ? 'var(--card)' : 'transparent',
                  color:
                    viewMode === 'LIST'
                      ? 'var(--foreground)'
                      : 'var(--muted-foreground)',
                }}
                onClick={() => setViewMode('LIST')}
              >
                List
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {viewMode === 'CALENDAR' ? (
              <TripCalendarView trips={trips} onEditTrip={handleEditTrip} />
            ) : (
              <TripTableView
                trips={trips}
                selectedTripIds={selectedTripIds}
                onSelectTrip={handleSelectTrip}
                onSelectAll={handleSelectAllTrips}
                onEditTrip={handleEditTrip}
              />
            )}
          </div>
        </div>
      </div>

      {/* Drawer */}
      {drawerOpen && (
        <TripFormDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          routes={routes}
          buses={buses}
          initialTrip={editingTrip}
          onSave={handleSaveTrip}
        />
      )}
    </DashboardLayout>
  )
}

export default AdminTripSchedulingPage
