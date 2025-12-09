const ticketService = require('./src/services/ticketService');
const bookingRepository = require('./src/repositories/bookingRepository');

async function generateTicketForBooking(bookingReference) {
  try {
    console.log(`\n🎫 Generating ticket for: ${bookingReference}\n`);
    
    // 1. Get booking data
    const booking = await bookingRepository.findByReference(bookingReference);
    
    if (!booking) {
      throw new Error(`Booking ${bookingReference} not found`);
    }
    
    console.log('✅ Booking found');
    console.log(`   Status: ${booking.status}`);
    console.log(`   Contact: ${booking.contactEmail}`);
    
    // 2. Generate ticket
    const { ticketUrl, qrCode } = await ticketService.generateTicket({
      booking_reference: booking.bookingReference,
      booking_id: booking.bookingId,
      trip_id: booking.tripId,
      contact_email: booking.contactEmail,
      contact_phone: booking.contactPhone,
      total_price: booking.pricing.total,
      status: booking.status,
      passengers: booking.passengers || []
    });
    
    console.log('\n✅ Ticket generated successfully!');
    console.log(`   PDF URL: ${ticketUrl}`);
    console.log(`   QR Code: ${qrCode.substring(0, 50)}... (${qrCode.length} chars)`);
    
    // 3. Update database
    await bookingRepository.updateTicketUrls(booking.bookingId, ticketUrl, qrCode);
    console.log('✅ Database updated\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run for BK20251209001
generateTicketForBooking('BK20251209001')
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
