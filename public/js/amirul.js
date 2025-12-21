// public/js/amirul.js

function updateBooking() {
  const bookingId = window.currentBookingId || getBookingIdFromQuery();
  if (!bookingId) {
    alert('Missing booking ID.');
    return;
  }

  const bookingDate = gi('dateSelect').value;
  const bookingTime = gi('timeSelect').value;

  const jsonData = {
    bookingDate,
    bookingTime
  };

  // Basic validation
  if (!jsonData.bookingDate || !jsonData.bookingTime) {
    alert('Both date and time are required!');
    return;
  }

  var request = new XMLHttpRequest();
  request.open('PUT', '/api/booking/' + bookingId, true);
  request.setRequestHeader('Content-Type', 'application/json');

  request.onload = function () {
    let response = {};
    try {
      response = JSON.parse(request.responseText);
    } catch (e) {
      alert('Unexpected server response.');
      return;
    }

    if (request.status === 200 && response.message === 'Booking updated successfully!') {
      alert('Edited booking successfully!');
      window.location.href = 'home.html';
    } else {
      alert(response.message || 'Unable to edit booking!');
    }
  };

  request.onerror = function () {
    alert('Network error while updating booking.');
  };

  request.send(JSON.stringify(jsonData));
}
