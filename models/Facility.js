class Facility {
  constructor({
    facility_id,
    facility_name,
    description,
    location,
    openinghours,
    openingdays,
    image1,
    image2,
    image3
  }) {
    // Basic fields
    this.facility_id = facility_id || Date.now().toString()
    this.facility_name = facility_name || 'Unnamed Facility'
    this.description = description || 'No description provided.'
    this.location = location || 'Unknown'

    // Schedule
    this.openinghours = openinghours || '00:00 - 00:00'
    this.openingdays = openingdays || 'Monday - Sunday'

    // Images (default placeholders)
    this.image1 = image1 || '/images/facility-default.png'
    this.image2 = image2 || '/images/facility-default.png'
    this.image3 = image3 || '/images/facility-default.png'
  }
}

module.exports = { Facility }