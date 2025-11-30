// Trip Domain Types

export interface Route {
  id: string
  from: string
  to: string
  distance: number // in kilometers
  estimatedDuration: number // in minutes
  pickupPoints: string[]
  dropoffPoints: string[]
  status: 'ACTIVE' | 'INACTIVE'
}

export interface Bus {
  id: string
  name: string
  model: string
  plateNumber: string
  type: 'STANDARD' | 'LIMOUSINE' | 'SLEEPER'
  capacity: number
  amenities: string[]
  status: 'ACTIVE' | 'INACTIVE'
  imageUrl?: string
}

export interface Seat {
  id: string
  row: number
  column: number
  type: 'STANDARD' | 'VIP' | 'WINDOW' | 'AISLE'
  price: number
  isAvailable: boolean
}

export interface SeatMap {
  id: string
  busId: string
  name: string
  rows: number
  columns: number
  seats: Seat[]
}

export interface Operator {
  id: string
  name: string
  email: string
  phone: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
  createdAt: string
  performanceMetrics?: {
    totalTrips: number
    averageRating: number
    cancellationRate: number
  }
}

export interface PickupPoint {
  pointId: string
  name: string
  address: string
  time: string // ISO 8601 format
}

export interface DropoffPoint {
  pointId: string
  name: string
  address: string
  time: string // ISO 8601 format
}

export interface Policies {
  cancellationPolicy: string
  modificationPolicy: string
  refundPolicy: string
}

export interface Trip {
  tripId: string
  route: {
    routeId: string
    origin: string
    destination: string
    distanceKm: number
    estimatedMinutes: number
  }
  operator: {
    operatorId: string
    name: string
    rating: number
    logo?: string
  }
  bus: {
    busId: string
    model: string
    plateNumber: string
    seatCapacity: number
    busType: 'STANDARD' | 'LIMOUSINE' | 'SLEEPER'
    amenities: string[]
  }
  schedule: {
    departureTime: string // ISO 8601 format
    arrivalTime: string // ISO 8601 format
    duration: number // in minutes
  }
  pricing: {
    basePrice: number
    currency: string
    serviceFee?: number
  }
  availability: {
    totalSeats: number
    availableSeats: number
    occupancyRate: number
  }
  policies: Policies
  pickupPoints: PickupPoint[]
  dropoffPoints: DropoffPoint[]
  status: 'active' | 'inactive'
}

export interface TripFormData {
  id?: string
  routeId: string
  busId: string
  date: string
  departureTime: string
  arrivalTime: string
  basePrice: number | string
  status: 'ACTIVE' | 'INACTIVE'
  isRecurring: boolean
  recurrenceType: 'NONE' | 'DAILY' | 'WEEKLY'
  recurrenceDays: string[]
  recurrenceEndDate: string
}

export const WEEKDAYS = [
  'MON',
  'TUE',
  'WED',
  'THU',
  'FRI',
  'SAT',
  'SUN',
] as const
