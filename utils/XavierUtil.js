const fs = require('fs').promises
const path = require('path')
const { Facility } = require('../models/Facility') 

const FACILITIES_FILE = path.join(__dirname, 'facilities.json')

async function readFacilities() {
  try {
    const data = await fs.readFile(FACILITIES_FILE, 'utf8')
    return JSON.parse(data || '[]')
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
    const { facility_id, facility_name, location } = req.body

    if (!facility_id || !facility_name || !location) {
      return res
        .status(400)
        .json({ message: 'facility_id, facility_name and location are required' })
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
