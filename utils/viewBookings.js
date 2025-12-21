// utils/viewBookingsUtil.js
const fs = require('fs');
const path = require('path');

const BOOKINGS_PATH = path.join(__dirname, 'bookings.json');

/**
 * VIEW BOOKINGS FEATURE (Resident)
 * This util acts as an Express route handler, same style as
 */
const ViewBookings = (req, res) => {
  try {
    // authMiddleware should have attached req.user
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Read Bookings.json
    const fileContent = fs.readFileSync(BOOKINGS_PATH, 'utf8');
    const allBookings = JSON.parse(fileContent);

    // Filter bookings for this user only
    const userBookings = allBookings.filter(b => b.userId === userId);

    return res.json({ bookings: userBookings });
  } catch (err) {
    console.error('Error in ViewBookingsUtils:', err);
    return res.status(500).json({ message: 'Failed to load bookings' });
  }
};

module.exports = {
  ViewBookings
};
