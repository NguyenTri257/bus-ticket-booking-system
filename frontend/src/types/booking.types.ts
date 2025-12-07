import type { Trip } from './trip.types'

export interface Passenger {
  fullName: string
  name?: string // alias for fullName
  idNumber?: string
  phone?: string
  seatNumber: string
  price?: number
  passengerType?: string
}

export interface User {
  userId: number
  email: string
  phone: string | null
  fullName: string
  role: 'passenger' | 'admin'
  emailVerified: boolean
}

export interface ETicket {
  ticketUrl: string | null
  qrCode: string | null
}

export interface CreateBookingRequest {
  tripId: string
  passengers: Passenger[]
  contactEmail?: string
  contactPhone?: string
  isGuestCheckout: boolean
}

export interface Booking {
  bookingId: string
  bookingReference: string
  tripId: string
  userId: string | null
  contactEmail: string
  contactPhone: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  totalPrice: number
  serviceFee?: number
  lockedUntil: string | null
  createdAt: string
  updatedAt: string
  passengers: Passenger[]
  eTicket?: ETicket
  trip?: Trip
  user?: User
}

export interface BookingResponse {
  success: boolean
  data: Booking
  message: string
}

export interface BookingError {
  error: string
  message: string
  code: string
}
