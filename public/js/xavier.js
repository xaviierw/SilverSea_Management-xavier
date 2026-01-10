import { parseOpeningHours } from './test/validation.js';

const qs = sel => document.querySelector(sel)

// Validate "HH:MM - HH:MM" and ensure start < end
function parseOpeningHours(input) {
  if (!input) return { ok: true, empty: true }

  // allow "10:00-22:00" or "10:00 - 22:00"
  const m = input.trim().match(/^(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})$/)
  if (!m) {
    return {
      ok: false,
      message: 'Opening Hours must be in format HH:MM - HH:MM (e.g. 10:00 - 22:00)'
    }
  }

  const sh = Number(m[1])
  const sm = Number(m[2])
  const eh = Number(m[3])
  const em = Number(m[4])

  const validHour = h => h >= 0 && h <= 23
  const validMin = mm => mm >= 0 && mm <= 59

  if (!validHour(sh) || !validHour(eh) || !validMin(sm) || !validMin(em)) {
    return {
      ok: false,
      message: 'Opening Hours has invalid time values (00:00 to 23:59 only)'
    }
  }

  const start = sh * 60 + sm
  const end = eh * 60 + em

  if (start >= end) {
    return {
      ok: false,
      message: 'Opening Hours start time must be earlier than end time'
    }
  }

  return { ok: true, start, end }
}

async function addFacility() {
  const jsonData = {
    facility_id: qs('#facilityId')?.value.trim(),
    facility_name: qs('#facilityName')?.value.trim(),
    location: qs('#facilityLocation')?.value.trim(),
    description: qs('#facilityDescription')?.value.trim(),
    openinghours: qs('#facilityOpeningHours')?.value.trim(),
    openingdays: qs('#facilityOpeningDays')?.value.trim(),
  }

  if (!jsonData.facility_id) {
    alert('Facility ID is required!')
    return
  }

  // allow any chars, enforce max length 10
  if (jsonData.facility_id.length > 10) {
    alert('Facility ID must not exceed 10 characters')
    return
  }

  if (!jsonData.facility_name) {
    alert('Facility Name is required!')
    return
  }

  // enforce max length 25
  if (jsonData.facility_name.length > 25) {
    alert('Facility name must not exceed 25 characters')
    return
  }

  if (!jsonData.location) {
    alert('Facility location is required!')
    return
  }

  // enforce max length 25
  if (jsonData.location.length > 25) {
    alert('Facility location must not exceed 25 characters')
    return
  }

  // Opening hours boundary validation (start must be earlier than end)
  const ohCheck = parseOpeningHours(jsonData.openinghours)
  if (!ohCheck.ok) {
    alert(ohCheck.message)
    return
  }

  try {
    const res = await fetch('/api/facility', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jsonData)
    })

    const response = await res.json().catch(() => ({}))

    if (!res.ok) {
      alert(response.message || 'Unable to add facility!')
      return
    }

    alert('Added Facility: ' + jsonData.facility_name + '!')

    if (window.loadFacilities) {
      try {
        await window.loadFacilities()
      } catch (err) {
      }
    }

    const form = qs('#facilityForm')
    if (form) {
      form.reset()
    }

  } catch (err) {
    alert('Unable to add facility! (network or server error)')
  }
}
