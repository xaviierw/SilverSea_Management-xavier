class Facility {
  constructor({
    facility_id,
    facility_name,
    description,
    location,
    openinghours,
    openingdays
  }) {
    // Basic fields
    this.facility_id = facility_id || Date.now().toString()
    this.facility_name = facility_name || 'Unnamed Facility'
    this.description = description || 'No description provided.'
    this.location = location || 'Unknown'

    // Schedule
    this.openinghours = openinghours || '00:00 - 00:00'
    this.openingdays = openingdays || 'Monday - Sunday'
  }
}

module.exports = { Facility }