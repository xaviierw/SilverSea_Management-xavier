const fs = require('fs').promises
const path = require('path')

// json file path
const FAC_FILE = path.join(__dirname, 'facilities.json')

async function readFacilities() {
  const raw = await fs.readFile(FAC_FILE, 'utf8')
  return JSON.parse(raw)
}

async function writeFacilities(facilities) {
  await fs.writeFile(FAC_FILE, JSON.stringify(facilities, null, 2))
}

// Admin: Get all facilities
async function getAllTheFacilities(req, res) {
  try {
    const facilities = await readFacilities()
    res.json({ facilities })
  } catch (err) {
    console.error('Failed to load facilities', err)
    res.status(500).json({ message: 'Failed to load facilities' })
  }
}

// Admin: Update facility
async function updateFacility(req, res) {
  try {
    const facilities = await readFacilities()
    const index = facilities.findIndex(
      f => String(f.facility_id) === String(req.params.id)
    )

    if (index === -1) {
      return res.status(404).json({ message: 'Facility not found' })
    }

    facilities[index] = { ...facilities[index], ...req.body }
    await writeFacilities(facilities)

    res.json({
      message: 'Facility updated successfully',
      facility: facilities[index]
    })
  } catch (err) {
    console.error('Failed to update facility', err)
    res.status(500).json({ message: 'Failed to update facility' })
  }
}

// Admin: Delete facility
async function deleteFacility(req, res) {
  try {
    const facilities = await readFacilities()
    const index = facilities.findIndex(
      f => String(f.facility_id) === String(req.params.id)
    )

    if (index === -1) {
      return res.status(404).json({ message: 'Facility not found' })
    }

    const removed = facilities.splice(index, 1)
    await writeFacilities(facilities)

    res.json({ message: 'Facility deleted successfully', removed })
  } catch (err) {
    console.error('Failed to delete facility', err)
    res.status(500).json({ message: 'Failed to delete facility' })
  }
}

//
module.exports = {
  getAllTheFacilities,
  updateFacility,
  deleteFacility
}
