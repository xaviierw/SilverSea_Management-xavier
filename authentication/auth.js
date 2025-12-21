const fs = require('fs/promises')
const path = require('path')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const USERS_FILE = path.join(__dirname, '../utils/users.json')
const APP_SECRET = process.env.APP_SECRET || 'change_this_secret'

const readUsers = async () => {
  const raw = await fs.readFile(USERS_FILE, 'utf8')
  return JSON.parse(raw)
}

const findUserByEmail = async (email) => {
  const users = await readUsers()
  return users.find(
    u => u.email.toLowerCase() === String(email).toLowerCase()
  )
}

const verifyPassword = async (plain, hash) => bcrypt.compare(plain, hash)

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    APP_SECRET,
    { expiresIn: '8h' }
  )
}

const verifyToken = (token) => jwt.verify(token, APP_SECRET)

module.exports = {
  readUsers,
  findUserByEmail,
  verifyPassword,
  generateToken,
  verifyToken
}