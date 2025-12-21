const {
  findUserByEmail,
  verifyPassword,
  generateToken
} = require('./auth')

// POST /api/login
async function login(req, res) {
  try {
    const { email, password, role: portalRole } = req.body

    // Basic validation
    if (!email || !password || !portalRole) {
      return res
        .status(400)
        .json({ message: 'Email, password are required' })
    }

    const user = await findUserByEmail(email)
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })

    const ok = await verifyPassword(password, user.password)
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' })

    // Check that the user is logging in from the correct portal
    if (user.role !== portalRole) {
      return res.status(403).json({
        message:
          user.role === 'admin'
            ? 'Invalid account. Please log in via the correct credentials and tab.'
            : 'Invalid account. Please log in via the correct credentials and tab.'
      })
    }

    const token = generateToken(user)
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 1000 * 60 * 60 * 8 // 8 hours
    })

    res.json({ message: 'Logged in', role: user.role, name: user.name })
  } catch (err) {
    console.error('Login error', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// GET /api/session
function getSession(req, res) {
  // req.user is set by authRequired middleware
  res.json({ authenticated: true, user: req.user })
}

// POST /api/logout
function logout(req, res) {
  res.clearCookie('token')
  res.json({ message: 'Logged out' })
}

module.exports = {
  login,
  getSession,
  logout
}