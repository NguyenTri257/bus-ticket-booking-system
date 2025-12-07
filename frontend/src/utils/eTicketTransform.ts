import type { Booking } from '@/types/booking.types'
import type { ETicketData } from '@/components/booking/ETicket'

/**
 * Transform a Booking object from the API into ETicketData format
 * suitable for the ETicket component
 */
export function transformBookingToETicket(booking: Booking): ETicketData {
  // Calculate duration if not provided
  const getDuration = (): number | undefined => {
    if (booking.trip?.schedule?.duration) {
      return booking.trip.schedule.duration
    }
    if (
      booking.trip?.schedule?.departure_time &&
      booking.trip?.schedule?.arrival_time
    ) {
      const departure = new Date(booking.trip.schedule.departure_time)
      const arrival = new Date(booking.trip.schedule.arrival_time)
      return Math.floor((arrival.getTime() - departure.getTime()) / (1000 * 60))
    }
    return undefined
  }

  return {
    bookingReference: booking.bookingReference,
    status: booking.status as 'confirmed' | 'pending' | 'cancelled',
    paymentStatus: booking.paymentStatus as 'paid' | 'pending' | 'failed',
    bookingDate: booking.createdAt,
    passengers: booking.passengers.map((p) => ({
      name: p.name || p.fullName || 'Unknown',
      seatNumber: p.seatNumber,
      passengerType: p.passengerType || 'adult',
    })),
    trip: {
      route: {
        originCity: booking.trip?.route?.origin || 'N/A',
        destinationCity: booking.trip?.route?.destination || 'N/A',
        distance: booking.trip?.route?.distance_km,
      },
      operator: {
        name: booking.trip?.operator?.name || 'Bus Operator',
        logo: booking.trip?.operator?.logo,
      },
      schedule: {
        departureTime:
          booking.trip?.schedule?.departure_time || booking.createdAt,
        arrivalTime: booking.trip?.schedule?.arrival_time || booking.createdAt,
        duration: getDuration(),
      },
      bus: {
        busNumber: booking.trip?.bus?.plate_number || 'N/A',
        type: booking.trip?.bus?.bus_type || 'Standard',
      },
    },
    pricing: {
      subtotal: booking.totalPrice - (booking.serviceFee || 0),
      serviceFee: booking.serviceFee || 0,
      total: booking.totalPrice,
    },
    contact: {
      email: booking.contactEmail || booking.user?.email,
      phone: booking.contactPhone || (booking.user?.phone ?? undefined),
    },
    qrCode: booking.eTicket?.qrCode || undefined,
    ticketUrl: booking.eTicket?.ticketUrl || undefined,
  }
}

/**
 * Check if a booking has sufficient data to display an e-ticket
 */
export function canDisplayETicket(booking: Booking): boolean {
  return !!(
    booking.bookingReference &&
    booking.status &&
    booking.paymentStatus &&
    booking.passengers &&
    booking.passengers.length > 0 &&
    booking.totalPrice !== undefined
  )
}

/**
 * Check if e-ticket assets (QR code, PDF) are available
 */
export function hasETicketAssets(booking: Booking): boolean {
  return !!(booking.eTicket?.qrCode || booking.eTicket?.ticketUrl)
}
