/**
 * Generate a unique booking reference
 * Format: BK + YYYYMMDD + Sequential Number (5 digits)
 * Example: BK20251205001
 */
function generateBookingReference() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 99999) + 1).padStart(5, '0');
  
  const prefix = process.env.BOOKING_REFERENCE_PREFIX || 'BK';
  return `${prefix}${year}${month}${day}${random}`;
}

/**
 * Calculate service fee based on subtotal
 * @param {number} subtotal - Booking subtotal
 * @returns {number} Service fee
 */
function calculateServiceFee(subtotal) {
  const percentageFee = subtotal * (parseFloat(process.env.SERVICE_FEE_PERCENTAGE || 3) / 100);
  const fixedFee = parseFloat(process.env.SERVICE_FEE_FIXED || 10000);
  return Math.round(percentageFee + fixedFee);
}

/**
 * Calculate booking expiration time
 * @returns {Date} Expiration timestamp
 */
function calculateLockExpiration() {
  const minutes = parseInt(process.env.BOOKING_LOCK_DURATION_MINUTES || 10, 10);
  return new Date(Date.now() + minutes * 60 * 1000);
}

/**
 * Check if booking is still locked (not expired)
 * @param {Date} lockedUntil - Lock expiration timestamp
 * @returns {boolean}
 */
function isBookingLocked(lockedUntil) {
  if (!lockedUntil) return false;
  return new Date(lockedUntil) > new Date();
}

/**
 * Format price to 2 decimal places
 * @param {number} price
 * @returns {number}
 */
function formatPrice(price) {
  return Math.round(price * 100) / 100;
}

/**
 * Validate seat codes format
 * @param {Array<string>} seatCodes
 * @returns {boolean}
 */
function validateSeatCodes(seatCodes) {
  if (!Array.isArray(seatCodes) || seatCodes.length === 0) {
    return false;
  }
  // Seat code format: A1, B2, etc.
  const seatPattern = /^[A-Z]\d{1,2}$/;
  return seatCodes.every(code => seatPattern.test(code));
}

/**
 * Map database row to booking object
 * @param {object} row - Database row
 * @returns {object} Formatted booking
 */
function mapToBooking(row) {
  return {
    bookingId: row.booking_id,
    bookingReference: row.booking_reference,
    tripId: row.trip_id,
    userId: row.user_id,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    status: row.status,
    lockedUntil: row.locked_until,
    pricing: {
      subtotal: parseFloat(row.subtotal),
      serviceFee: parseFloat(row.service_fee),
      total: parseFloat(row.total_price),
      currency: row.currency
    },
    payment: {
      method: row.payment_method,
      status: row.payment_status,
      paidAt: row.paid_at
    },
    cancellation: row.cancellation_reason ? {
      reason: row.cancellation_reason,
      refundAmount: parseFloat(row.refund_amount)
    } : null,
    eTicket: {
      ticketUrl: row.ticket_url,
      qrCodeUrl: row.qr_code_url
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

/**
 * Map database row to passenger object
 * @param {object} row - Database row
 * @returns {object} Formatted passenger
 */
function mapToPassenger(row) {
  return {
    ticketId: row.ticket_id,
    bookingId: row.booking_id,
    seatCode: row.seat_code,
    price: parseFloat(row.price),
    passenger: {
      fullName: row.full_name,
      phone: row.phone,
      documentId: row.document_id
    },
    createdAt: row.created_at
  };
}

module.exports = {
  generateBookingReference,
  calculateServiceFee,
  calculateLockExpiration,
  isBookingLocked,
  formatPrice,
  validateSeatCodes,
  mapToBooking,
  mapToPassenger
};
