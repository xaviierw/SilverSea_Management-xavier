// --------------------
// Helpers
// --------------------
const qs = s => document.querySelector(s);

// --------------------
// State Variables
// --------------------
const facilityId = new URLSearchParams(location.search).get('id');
const dateSelect = qs('#dateSelect');
const timeSelect = qs('#timeSelect');
const summary = qs('#bookingSummary');

let allSlots = [];
let selected = []; // global selected slots
// const maxDuration = 2;

// --------------------
// Utility Functions
// --------------------
const fmtTime = t => t;
const fmtSlot = slot =>
  `${slot.date} at ${slot.time}`;

// Update summary
const updateSummary = () => {
  if (!selected.length) {
    summary.textContent = 'Please select date and time.';
    return;
  }
  console.log('Selected =', selected)

  const slotTexts = selected.map(fmtSlot);
  summary.textContent = `Selected Slot(s): ${slotTexts.join(' | ')}`;


};

// --------------------
// Populate dropdowns
// --------------------
const populateDropdowns = () => {
  // Populate date dropdown
  const uniqueDates = [...new Set(allSlots.map(s => s.date))];
  dateSelect.innerHTML = '';
  uniqueDates.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d;
    opt.textContent = d;
    dateSelect.appendChild(opt);
  });

  updateTimeOptions();
};

// Populate time dropdown based on selected date
const updateTimeOptions = () => {
  const selectedDate = dateSelect.value;
  const timesForDate = allSlots
    .filter(s => s.date === selectedDate)
    .map(s => s.time);

  timeSelect.innerHTML = '';
  timesForDate.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    timeSelect.appendChild(opt);
  });

//   // Pre-select first slot
//   if (timesForDate.length > 0) {
//     selected = [{ date: selectedDate, time: timesForDate[0] }];
//   } else {
//     selected = [];
//   }

  updateSummary();
};

// --------------------
// Event listeners
// --------------------
dateSelect.addEventListener('change', updateTimeOptions);
timeSelect.addEventListener('change', () => {
  const slot = { date: dateSelect.value, time: timeSelect.value };
  const idx = selected.findIndex(s => s.date === slot.date && s.time === slot.time);

  if (idx >= 0) {
    // Already selected → deselect
    selected.splice(idx, 1);
  } else {
    // // Add if under max duration
    // if (selected.length >= maxDuration) {
    //   alert(`You can only select up to ${maxDuration} slots.`);
    //   // reset dropdown to previous selection
    //   timeSelect.value = selected[selected.length - 1]?.time || '';
    //   return;
    // }
    selected.push(slot);
  }

  updateSummary();
});


// --------------------
// Fetch slots from backend
// --------------------
const initSlots = async () => {
  if (!facilityId) {
    alert('Missing facility id');
    return;
  }

  try {
    const res = await fetch(`/api/facilityslots/${facilityId}`);
    if (!res.ok) throw new Error('Failed to fetch slots');

    const data = await res.json();
    allSlots = data.availableSlots || [];

    if (!allSlots.length) {
      summary.textContent = 'No available slots.';
      return;
    }

    populateDropdowns();
  } catch (err) {
    console.error(err);
    summary.textContent = 'Error loading slots.';
  }
};

// --------------------
// Init
// --------------------
initSlots();
