const tableBody = document.getElementById('facilitiesBody')

function renderFacilities(facilities) {
  if (!tableBody) return

  if (!facilities || !facilities.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="muted center">
          No facilities found. Add a facility to get started.
        </td>
      </tr>
    `
    return
  }

  tableBody.innerHTML = ''

  facilities.forEach(facility => {
    const tr = document.createElement('tr')

    const idCell = document.createElement('td')
    idCell.textContent = facility.facility_id

    const nameCell = document.createElement('td')
    nameCell.textContent = facility.facility_name || '(Unnamed)'

    const locCell = document.createElement('td')
    locCell.textContent = facility.location || '-'

    const hoursCell = document.createElement('td')
    hoursCell.textContent = facility.openinghours || '-'

    const actionsCell = document.createElement('td')
    actionsCell.classList.add('actions')

    // Edit button
    const editBtn = document.createElement('button')
    editBtn.textContent = 'Edit'
    editBtn.className = 'btn btn-ghost'
    editBtn.addEventListener('click', () => {
      editFacility(facility)
    })

    // Delete button
    const delBtn = document.createElement('button')
    delBtn.textContent = 'Delete'
    delBtn.className = 'btn btn-ghost'
    delBtn.style.borderColor = '#73313a'
    delBtn.style.background = '#2a1116'
    delBtn.addEventListener('click', () => {
      deleteFacility(facility)
    })

    actionsCell.appendChild(editBtn)
    actionsCell.appendChild(delBtn)

    tr.appendChild(idCell)
    tr.appendChild(nameCell)
    tr.appendChild(locCell)
    tr.appendChild(hoursCell)
    tr.appendChild(actionsCell)

    tableBody.appendChild(tr)
  })
}

async function loadFacilities() {
  if (!tableBody) return

  try {
    const res = await fetch('/api/facilities')
    if (!res.ok) {
      throw new Error('Failed to load facilities')
    }
    const data = await res.json()
    const facilities = data.facilities || []
    renderFacilities(facilities)
  } catch (err) {
    console.error(err)
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="muted center">
          Error loading facilities.
        </td>
      </tr>
    `
  }
}

window.loadFacilities = loadFacilities

async function deleteFacility(facility) {
  const ok = window.confirm(
    `Delete facility "${facility.facility_name || facility.facility_id}"?`
  )
  if (!ok) return

  try {
    const res = await fetch(`/api/facility/${facility.facility_id}`, {
      method: 'DELETE'
    })

    const body = await res.json().catch(() => ({}))

    if (!res.ok || body.message) {
      alert(body.message || 'Failed to delete facility')
      return
    }

    await loadFacilities()
  } catch (err) {
    console.error(err)
    alert('Failed to delete facility (network or server error)')
  }
}

async function editFacility(facility) {
  // keep UI simple → just use prompt for now
  const newName = prompt(
    'Facility Name',
    facility.facility_name || ''
  )
  if (newName === null) return

  const newLocation = prompt(
    'Location',
    facility.location || ''
  )
  if (newLocation === null) return

  const newOpeningHours = prompt(
    'Opening Hours',
    facility.openinghours || ''
  )
  if (newOpeningHours === null) return

  const updated = {
    facility_id: facility.facility_id,
    facility_name: newName.trim(),
    location: newLocation.trim(),
    description: facility.description || '',
    openinghours: newOpeningHours.trim(),
    openingdays: facility.openingdays || '',
    image1: facility.image1 || '',
    image2: facility.image2 || '',
    image3: facility.image3 || ''
  }

  try {
    const res = await fetch(`/api/facility/${facility.facility_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    })

    const body = await res.json().catch(() => ({}))

    if (!res.ok || body.message) {
      alert(body.message || 'Failed to update facility')
      return
    }

    await loadFacilities()
  } catch (err) {
    console.error(err)
    alert('Failed to update facility (network or server error)')
  }
}

window.addEventListener('DOMContentLoaded', () => {
  loadFacilities()
})
