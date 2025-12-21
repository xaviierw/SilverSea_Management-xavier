const { verifyToken } = require('./auth')

// Authentication Middleware checks if user has valid JWT token or not
const authRequired = (roles = []) => (req, res, next) => {
  try {
    const token = req.cookies?.token
    if (!token) {
      return res.status(401).redirect('/index.html')
    }

    const payload = verifyToken(token)
    req.user = payload

    if (roles.length && !roles.includes(payload.role)) {
      res.clearCookie('token')
      return res.redirect('/index.html')
    }

    next()
  } catch {
    return res.status(401).redirect('/index.html')
  }
}

const protectHtml = (req, res, next) => {
  const isHtml = req.method === 'GET' && req.path.endsWith('.html')
  const isPublic = req.path === '/index.html'
  if (isHtml && !isPublic) {
    return authRequired()(req, res, next)
  }
  next()
}

module.exports = {
  authRequired,
  protectHtml
}