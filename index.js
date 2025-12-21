require('dotenv').config()
const express = require('express')
const cookieParser = require('cookie-parser')
const path = require('path')

// Auth route handlers
const {
  login,
  getSession,
  logout
} = require('./authentication/authController')

// Auth middleware
const {
  authRequired,
  protectHtml
} = require('./authentication/authMiddleware')

// Facility Resident
const {
  getAllFacilities, 
  getFacilityById
} = require('./utils/facilityResident')

// Xavier's Admin CRUD feature (need to separate)
const {
  addFacility
} = require('./utils/XavierUtil')

const {
    updateFacility,
    deleteFacility,
    getAllTheFacilities
} = require('./utils/facilityManageUtil')

// Get Facility Slots By ID feature
const {
  getFacilitySlotsUtils
} = require('./utils/GetFacilitySlotsById') 

// KahBao's Create Booking Feature
const {
  CreateBookingUtils
} = require('./utils/KahBaoUtil') 

// View Bookings feature (Resident)
const {
  ViewBookings
} = require('./utils/viewBookings');

// View booking by ID (Resident)
const {
  ViewBookingByIdUtils
} = require('./utils/viewBookingsById');

// Amirul's Modify feature
const {
  ModifyBookingUtils
} = require('./utils/AmirulUtil');

const app = express()
const PORT = process.env.PORT || 5050

// Middleware
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())

// Disable caching
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
  res.set('Pragma', 'no-cache')
  res.set('Expires', '0')
  next()
})

// Protect all HTML pages except login (index.html)
app.use(protectHtml)

// Routes for HTML pages
app.get('/home.html', authRequired(['resident']), (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'))
})

app.get('/facility.html', authRequired(['resident']), (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'facility.html'))
})

app.get('/xavier.html', authRequired(['admin']), (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'xavier.html'))
})

app.get('/amirul.html', authRequired(['resident']), (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'amirul.html'))
})

app.get('/kahbao.html', authRequired(['resident']), (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'kahbao.html'))
})

app.use(express.static(path.join(__dirname, 'public')))

app.post('/api/login', login)
app.get('/api/session', authRequired(), getSession)
app.post('/api/logout', logout)


// Resident routes
app.get('/api/facilities', authRequired(), getAllFacilities)
app.get('/api/facility/:id', authRequired(), getFacilityById)

// Xavier's C Route
app.post('/api/facility', authRequired(['admin']), addFacility)

// Admin's RUD Route
app.get('/api/facilities', authRequired(['admin']), getAllTheFacilities)
app.put('/api/facility/:id', authRequired(['admin']), updateFacility)
app.delete('/api/facility/:id', authRequired(['admin']), deleteFacility)


// Get Facility Slots By ID FEATURE (Resident)
app.get('/api/facilityslots/:id', authRequired(['resident']), getFacilitySlotsUtils)


// KAHBAO CREATE BOOKING FEATURE (Resident)
app.post('/api/createBooking/:id', authRequired(['resident']), CreateBookingUtils)

// VIEW BOOKINGS FEATURE (Resident)
app.get('/api/bookings', authRequired(['resident']), ViewBookings)

// Get booking by ID
app.get('/api/booking/:id', authRequired(['resident']), ViewBookingByIdUtils);

// Amirul Modify Feature (resident)
app.put('/api/booking/:id', authRequired(['resident']), ModifyBookingUtils);

// Default route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/' + startPage);
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}`);
});

module.exports = { app, server };