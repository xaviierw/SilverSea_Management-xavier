const {Booking} = require('../models/Booking');
const { verifyToken } = require('../authentication/auth')
const fs = require('fs').promises;
const path = require('path');
const BOOKINGS_FILE = path.join(__dirname, 'bookings.json');

async function CreateBookingUtils(req, res) {
    try {
        const token = req.cookies?.token
        const payload = verifyToken(token)
        const userId = payload.id;
        const facilityId = req.params.id;
        const { bookingDate, bookingTime } = req.body;

        const bookingId = Date.now() + Math.floor(Math.random() * 1000);
        const createdAt = new Date().toISOString();
        const status = 1; // Active

        const newBooking = new Booking(bookingId, userId, facilityId, bookingDate, bookingTime, createdAt, status);
        let book = [];
        try{
            const data = await fs.readFile(BOOKINGS_FILE, 'utf8');
            book = JSON.parse(data);
            // Check for existing booking conflict
            const conflict = book.find(b =>
                String(b.facilityId) === String(facilityId) &&
                b.bookingDate === bookingDate &&
                b.bookingTime === bookingTime
            );
            if (conflict) {
                return res.status(409).json({ message: "Booking conflict: slot already booked" });
            }
        } catch (err) {
            if (err.code !== 'ENOENT') {
                // file doesn't exist, create empty array
                book = [];
                await fs.writeFile(BOOKINGS_FILE, JSON.stringify(book, null, 2), 'utf8');
            }else{
                console.error("Error reading bookings file:", err);
            }
        }
        book.push(newBooking);
        await fs.writeFile(BOOKINGS_FILE, JSON.stringify(book, null, 2), 'utf8');
        return res.status(201).json({ message: "Booking created successfully", booking: newBooking });
    }catch (err) {
        console.error("Error creating booking:", err);
        res.status(500).json({ message: "Failed to create booking" });
    }
}
module.exports = {CreateBookingUtils}