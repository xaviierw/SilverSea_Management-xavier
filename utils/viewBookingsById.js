// utils/viewBookingsById.js
const { verifyToken } = require('../authentication/auth');
const fs = require('fs').promises;
const path = require('path');

const BOOKINGS_FILE = path.join(__dirname, 'bookings.json');
const FACILITIES_FILE = path.join(__dirname, 'facilities.json');

async function ViewBookingByIdUtils(req, res) {
  try {
    const token = req.cookies?.token;
    const payload = verifyToken(token);
    const userId = payload.id;

    const bookingId = req.params.id;

    const data = await fs.readFile(BOOKINGS_FILE, 'utf8');
    const bookings = JSON.parse(data);

    const booking = bookings.find(
      (b) =>
        String(b.bookingId) === String(bookingId) &&
        b.userId === userId      // ✅ only own booking
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Look up facility name
    let facilityName = String(booking.facilityId);
    try {
      const facilitiesRaw = await fs.readFile(FACILITIES_FILE, 'utf8');
      const facilities = JSON.parse(facilitiesRaw);
      const facility = facilities.find(
        f => String(f.facility_id) === String(booking.facilityId)
      );
      if (facility) {
        facilityName = facility.facility_name;
      }
    } catch (e) {
      console.error('Error reading facilities.json:', e);
    }

    return res.json({ booking, facilityName });
  } catch (err) {
    console.error('Error in ViewBookingByIdUtils:', err);
    return res.status(500).json({ message: 'Failed to load booking' });
  }
}

module.exports = {
  ViewBookingByIdUtils
};
