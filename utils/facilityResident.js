const { readFacilities } = require('./facilityData')

async function getAllFacilities(req, res) {
  try {
    const facilities = await readFacilities()
    res.json({ facilities })
  } catch (err) {
    console.error('Failed to load facilities', err)
    res.status(500).json({ message: 'Failed to load facilities' })
  }
}

async function getFacilityById(req, res) {
  try {
    const facilities = await readFacilities()
    const facility = facilities.find(
      f => String(f.facility_id) === String(req.params.id)
    )

    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' })
    }

    // keep same behaviour: return the object directly
    res.json(facility)
  } catch (err) {
    console.error('Failed to load facility', err)
    res.status(500).json({ message: 'Failed to load facility' })
  }
}

module.exports = {
  getAllFacilities,
  getFacilityById
}