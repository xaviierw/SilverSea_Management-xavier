class Booking {
  constructor(bookingId, userId, facilityId, bookingDate, bookingTime, createdAt, status) {
    this.bookingId = bookingId;       // Unique booking ID
    this.userId = userId;             // User who made the booking
    this.facilityId = facilityId;     // Facility being booked
    this.bookingDate = bookingDate;   // Date of booking (YYYY-MM-DD)
    this.bookingTime = bookingTime;   // Time of booking (HH:mm or 24h)
    this.createdAt = createdAt;       // Timestamp of creation
    this.status = status;             // 1 = Active, 2 = Cancelled
  }
}

module.exports = { Booking };