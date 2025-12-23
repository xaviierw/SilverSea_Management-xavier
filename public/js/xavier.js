const qs = sel => document.querySelector(sel)

async function addFacility() {
  const jsonData = {
    facility_id: qs('#facilityId')?.value.trim(),
    facility_name: qs('#facilityName')?.value.trim(),
    location: qs('#facilityLocation')?.value.trim(),
    description: qs('#facilityDescription')?.value.trim(),
    openinghours: qs('#facilityOpeningHours')?.value.trim(),
    openingdays: qs('#facilityOpeningDays')?.value.trim(),
    image1: qs('#facilityImage1')?.value.trim(),
    image2: qs('#facilityImage2')?.value.trim(),
    image3: qs('#facilityImage3')?.value.trim()
  }

  if (!jsonData.facility_id) {
    alert('Facility ID is required!')
    return
  }

  // ✅ REQUIRED CHANGE: allow any chars, enforce max length 10
  if (jsonData.facility_id.length > 10) {
    alert('Facility ID must not exceed 10 characters')
    return
  }

  if (!jsonData.facility_name) {
    alert('Facility Name is required!')
    return
  }

  // ✅ REQUIRED CHANGE: enforce max length 25
  if (jsonData.facility_name.length > 25) {
    alert('Facility name must not exceed 25 characters')
    return
  }

  if (!jsonData.location) {
    alert('Facility location is required!')
    return
  }

  // ✅ REQUIRED CHANGE: enforce max length 25
  if (jsonData.location.length > 25) {
    alert('Facility location must not exceed 25 characters')
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
        console.error('Failed to refresh facilities list:', err)
      }
    }

    const form = qs('#facilityForm')
    if (form) {
      form.reset()
    }

  } catch (err) {
    console.error(err)
    alert('Unable to add facility! (network or server error)')
  }
}
