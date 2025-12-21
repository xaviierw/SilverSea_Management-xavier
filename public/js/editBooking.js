// public/js/editBooking.js

function gi(id) {
  return document.getElementById(id);
}

function getBookingIdFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get('bookingId');
}

// Format Date -> "YYYY-MM-DD"
function toDateInputValue(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Build date options from original date up to +7 days
function populateDateOptions(originalDateStr) {
  const dateSelect = gi('dateSelect');
  dateSelect.innerHTML = '';

  const originalDate = new Date(originalDateStr);
  const maxDate = new Date(originalDate);
  maxDate.setDate(maxDate.getDate() + 7);

  for (let d = new Date(originalDate); d <= maxDate; d.setDate(d.getDate() + 1)) {
    const value = toDateInputValue(d);
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = value;
    dateSelect.appendChild(opt);
  }
}

// Build time options from 10:00 to 21:00 (1-hour slots, consistent with template)
function populateTimeOptions(selectedTime) {
  const timeSelect = gi('timeSelect');
  timeSelect.innerHTML = '';

  for (let hour = 10; hour < 22; hour++) {
    const time = String(hour).padStart(2, '0') + ':00';
    const opt = document.createElement('option');
    opt.value = time;
    opt.textContent = time;
    if (time === selectedTime) {
      opt.selected = true;
    }
    timeSelect.appendChild(opt);
  }
}

// Load booking details into the form (called from HTML body onload)
async function loadBookingForEdit() {
  const bookingId = getBookingIdFromQuery();
  if (!bookingId) {
    alert('Missing booking ID.');
    window.location.href = 'home.html';
    return;
  }

  try {
    const res = await fetch(`/api/booking/${bookingId}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to load booking');
    }

    const data = await res.json();
    const booking = data.booking;
    const facilityName = data.facilityName || booking.facilityId;

    // Display facility name and current booking date+time
    gi('facilityNameText').textContent = facilityName;
    gi('currentBookingText').textContent =
      `${booking.bookingDate} ${booking.bookingTime}`;

    // Populate selects
    populateDateOptions(booking.bookingDate);
    populateTimeOptions(booking.bookingTime);

    // Set initial selected values
    gi('dateSelect').value = booking.bookingDate;
    gi('timeSelect').value = booking.bookingTime;

    // store current booking id globally for updateBooking()
    window.currentBookingId = booking.bookingId;
  } catch (err) {
    console.error('Error loading booking:', err);
    alert('Error loading booking: ' + err.message);
    window.location.href = 'home.html';
  }
}
