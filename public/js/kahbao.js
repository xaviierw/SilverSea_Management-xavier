// const qs = (sel) => document.querySelector(sel);

async function handleConfirmBooking() {
  // Use the global `selected` from slots.js, NOT window.selected
  if (!Array.isArray(selected) || !selected.length) {
    alert('Please select at least one slot before booking.');
    return;
  }

  if (selected.length > 2) {
    alert('You can only select up to 2 slots');
    selected.length = 0;

    if (dateSelect) dateSelect.selectedIndex = 0;
    if (timeSelect) timeSelect.selectedIndex = 0;

    // Re-render the summary text in the UI
    if (typeof updateSummary === 'function') {
      updateSummary();
    }
    return;
  }

  const facilityId = new URLSearchParams(location.search).get('id');

  try {
    for (const slot of selected) {
      const payload = { bookingDate: slot.date, bookingTime: slot.time };
      console.log('Creating booking:', payload);

      const res = await fetch(`/api/createBooking/${facilityId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Booking failed');
      }
    }

    alert('✅ Booking successful!');
    qs('#bookingModal')?.classList.add('hidden');
    window.location.reload();
  } catch (err) {
    console.error(err);
    alert('❌ ' + err.message);
  }
}

