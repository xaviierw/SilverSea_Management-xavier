const { verifyToken } = require('../authentication/auth');
const fs = require('fs').promises;
const path = require('path');

const BOOKINGS_FILE = path.join(__dirname, 'bookings.json');
const TIMESLOT_FILE = path.join(__dirname, 'timeslot-template.json');

async function ModifyBookingUtils(req, res) {
  try {
    const token = req.cookies?.token;
    const payload = verifyToken(token);
    const userId = payload.id;

    const bookingId = req.params.id;
    const { bookingDate, bookingTime } = req.body;

    if (!bookingDate || !bookingTime) {
      return res.status(400).json({ message: 'Booking date and time are required!' });
    }

    const data = await fs.readFile(BOOKINGS_FILE, 'utf8');
    const bookings = JSON.parse(data);

    const index = bookings.findIndex(
      (b) => String(b.bookingId) === String(bookingId)
    );

    if (index === -1) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = bookings[index];

    // Only owner can modify
    if (booking.userId !== userId) {
      return res.status(403).json({ message: 'Not allowed to modify this booking' });
    }

    const originalDateStr = booking.bookingDate;
    const originalDate = new Date(originalDateStr);
    const newDate = new Date(bookingDate);

    if (isNaN(originalDate.getTime()) || isNaN(newDate.getTime())) {
      return res.status(400).json({ message: 'Invalid booking date format.' });
    }

    // Allow only original date + original date + 7 days
    const maxDate = new Date(originalDate);
    maxDate.setDate(maxDate.getDate() + 7);

    if (newDate < originalDate || newDate > maxDate) {
      return res.status(400).json({
        message: 'You can only change the booking date within 7 days from the original date.'
      });
    }

    // cannot choose the exact same timeslot (same date & same time)
    if (bookingDate === originalDateStr && bookingTime === booking.bookingTime) {
      return res.status(400).json({
        message: 'You cannot select the same timeslot as your current booking.'
      });
    }

    // Validate time using template (10:00–22:00 hourly)
    const tsRaw = await fs.readFile(TIMESLOT_FILE, 'utf8');
    const templates = JSON.parse(tsRaw);
    const template = templates[0];

    const [startHourStr] = template.start_time.split(':'); 
    const [endHourStr] = template.end_time.split(':');    
    const startHour = parseInt(startHourStr, 10);
    const endHour = parseInt(endHourStr, 10);

    const [hourStr, minuteStr] = bookingTime.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    if (
      isNaN(hour) ||
      isNaN(minute) ||
      minute !== 0 ||
      hour < startHour ||
      hour >= endHour
    ) {
      return res.status(400).json({
        message: 'Invalid booking time. Please choose a slot between 10:00 and 22:00.'
      });
    }

    const conflict = bookings.find(
      (b) =>
        String(b.bookingId) !== String(bookingId) &&
        String(b.facilityId) === String(booking.facilityId) &&
        b.bookingDate === bookingDate &&
        b.bookingTime === bookingTime
    );

    if (conflict) {
      return res.status(409).json({
        message: 'Booking conflict: this timeslot is already booked by another user.'
      });
    }

    // Update date & time
    booking.bookingDate = bookingDate;
    booking.bookingTime = bookingTime;

    await fs.writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2), 'utf8');

    return res.status(200).json({
      message: 'Booking updated successfully!',
      booking
    });
  } catch (err) {
    console.error('Error updating booking:', err);
    return res.status(500).json({ message: 'Failed to update booking' });
  }
}

module.exports = {
  ModifyBookingUtils
};
