const fs = require('fs').promises
const path = require('path')
const { Facility } = require('../models/Facility')

const FACILITIES_FILE = path.join(__dirname, 'facilities.json')

function parseOpeningHours(input) {
  if (!input) return { ok: true, empty: true }

  const m = String(input).trim().match(/^(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})$/)
  if (!m) return { ok: false, message: 'Opening Hours must be in format HH:MM - HH:MM (e.g. 10:00 - 22:00)' }

  const sh = Number(m[1])
  const sm = Number(m[2])
  const eh = Number(m[3])
  const em = Number(m[4])

  const validHour = h => h >= 0 && h <= 23
  const validMin = mm => mm >= 0 && mm <= 59

  if (!validHour(sh) || !validHour(eh) || !validMin(sm) || !validMin(em)) {
    return { ok: false, message: 'Opening Hours has invalid time values (00:00 to 23:59 only)' }
  }

  const start = sh * 60 + sm
  const end = eh * 60 + em

  if (start >= end) {
    return { ok: false, message: 'Opening Hours start time must be earlier than end time' }
  }

  return { ok: true }
}

async function readFacilities() {
  try {
    const data = await fs.readFile(FACILITIES_FILE, 'utf8')
    return JSON.parse(data)
  } catch (err) {
    if (err.code === 'ENOENT') return []
    throw err
  }
}

async function writeFacilities(facilities) {
  await fs.writeFile(FACILITIES_FILE, JSON.stringify(facilities, null, 2))
}

// POST /api/facility
async function addFacility(req, res) {
  try {
    const { facility_id, facility_name, location, openinghours } = req.body

    if (!facility_id || !facility_name || !location) {
      return res
        .status(400)
        .json({ message: 'facility_id, facility_name and location are required' })
    }

    if (String(facility_id).length > 10) {
      return res
        .status(400)
        .json({ message: 'Facility ID must not exceed 10 characters' })
    }

    if (String(facility_name).length > 25) {
      return res
        .status(400)
        .json({ message: 'Facility name must not exceed 25 characters' })
    }

    if (String(location).length > 25) {
      return res
        .status(400)
        .json({ message: 'Facility location must not exceed 25 characters' })
    }

    const ohCheck = parseOpeningHours(openinghours)
    if (!ohCheck.ok) {
      return res.status(400).json({ message: ohCheck.message })
    }

    const facilities = await readFacilities()

    const exists = facilities.some(
      f => String(f.facility_id) === String(facility_id)
    )
    if (exists) {
      return res.status(409).json({ message: 'Facility ID already exists' })
    }

    const newFacility = new Facility(req.body)

    facilities.push(newFacility)
    await writeFacilities(facilities)

    return res
      .status(201)
      .json({ message: 'Facility added successfully', facility: newFacility })
  } catch (err) {
    console.error('Error adding facility:', err)
    return res.status(500).json({ message: 'Server error adding facility' })
  }
}

module.exports = { addFacility }
