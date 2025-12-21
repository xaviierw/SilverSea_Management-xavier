const heroImages = [
  '/images/SilverSea.png' 
];

let heroIndex = 0;
const heroImg = document.getElementById('heroImage');

const showHero = i => {
  heroImg.src = heroImages[i];
};

// Helper
const qs = s => document.querySelector(s);

function statusToText(status) {
  const s = Number(status);
  switch (s) {
    case 1: return 'Active';
    case 2: return 'Cancelled';
    default: return 'Unknown';
  }
}

// 🔹 NEW: function used by the Modify button in the Action column
function goToModify(bookingId) {
  window.location.href = `amirul.html?bookingId=${bookingId}`;
}

// Handle Book Facility button
qs('#bookFacilityBtn').addEventListener('click', async () => {
  const modal = qs('#bookingModal');
  const modalBody = qs('#modalBody');
  modal.classList.remove('hidden');

  // Show loading state
  modalBody.innerHTML = `<p>Loading facilities...</p>`;
  
  try {
    const res = await fetch('/api/facilities');
    if (!res.ok) throw new Error('Bad response');
    const { facilities } = await res.json();
  
    if (!facilities?.length) {
      container.innerHTML = `<p>No facilities available.</p>`;
      return;
    }
    console.log('Facilities =', facilities);

    // populate dropdown options
    const selectHTML = `
      <label for="facilitySelect">Select Facility:</label>
      <select id="facilitySelect" class="facility-dropdown">
        ${facilities.map(f => `<option value="${f.facility_id}">${f.facility_name}</option>`).join('')}
      </select>
    `;
    modalBody.innerHTML = selectHTML;

  } catch (e) {
    console.error(e);
    const dropdown = qs('#facilitySelect');
    if (dropdown) {
      dropdown.innerHTML = `<option disabled>Failed to load facilities</option>`;
    } else {
      modalBody.innerHTML = `<p>Failed to load facilities.</p>`;
    }
  }
});

// Close modal on X button
closeModal.addEventListener('click', () => bookingModal.classList.add('hidden'));

// Optional: Close modal when clicking outside modal content
bookingModal.addEventListener('click', e => {
  if (e.target === bookingModal) {
    bookingModal.classList.add('hidden');
  }
});

// Redirect to a facility slot page
qs('#ContinueBtn').addEventListener('click', async () => {
  const facilitySelect = qs('#facilitySelect');
  
  if (!facilitySelect) {
    alert('Please select a facility.');
    return;
  }

  const selectedFacilityId = facilitySelect.value;

  // Redirect to another HTML page with the facility ID as a query parameter
  window.location.href = `kahbao.html?id=${selectedFacilityId}`;
});

async function loadResidentBookings() {
  const tbody = qs('#bookingsBody');

  // Show loading message
  tbody.innerHTML = `
    <tr>
      <td colspan="6">Loading your bookings...</td>
    </tr>
  `;

  try {
    const res = await fetch('/api/bookings'); // we rely on session, no userId in query
    if (!res.ok) throw new Error('Failed to fetch bookings');

    const data = await res.json();
    const bookings = data.bookings || [];

    if (bookings.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6">You have no bookings yet.</td>
        </tr>
      `;
      return;
    }

    const rowsHtml = bookings.map((b, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${b.facilityId}</td>
        <td>${b.bookingDate}</td>
        <td>${b.bookingTime}</td>
        <td>${statusToText(b.status)}</td>
        <td>
          <button class="btn-primary" onclick="goToModify(${b.bookingId})">
            Modify
          </button>
        </td>
      </tr>
    `).join('');

    tbody.innerHTML = rowsHtml;
  } catch (err) {
    console.error('Error loading bookings:', err);
    tbody.innerHTML = `
      <tr>
        <td colspan="6">Error loading bookings. Please try again later.</td>
      </tr>
    `;
  }
}

// Initial load
loadResidentBookings();
