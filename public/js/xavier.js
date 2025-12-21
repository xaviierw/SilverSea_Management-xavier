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

  if (!/^[0-9]+$/.test(jsonData.facility_id)) {
    alert('Facility ID must contain numbers only (e.g. 1, 2, 101)')
    return
  }

  if (!jsonData.facility_name) {
    alert('Facility Name is required!')
    return
  }

  if (!jsonData.location) {
    alert('Facility location is required!')
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

    // Reset the form after successful add
    const form = qs('#facilityForm')
    if (form) {
      form.reset()
    }

  } catch (err) {
    console.error(err)
    alert('Unable to add facility! (network or server error)')
  }
}

