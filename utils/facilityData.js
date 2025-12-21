const fs = require('fs').promises
const path = require('path')

const FAC_FILE = path.join(__dirname, 'facilities.json')

async function readFacilities() {
  const raw = await fs.readFile(FAC_FILE, 'utf8')
  return JSON.parse(raw)
}

async function writeFacilities(facilities) {
  await fs.writeFile(FAC_FILE, JSON.stringify(facilities, null, 2))
}

module.exports = {
  readFacilities,
  writeFacilities
}