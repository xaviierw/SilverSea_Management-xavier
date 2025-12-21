let currentMode = 'resident' // resident or admin

document.addEventListener('DOMContentLoaded', () => {
  const emailInput   = document.getElementById('email')
  const pwdInput     = document.getElementById('password')
  const registerBtn  = document.getElementById('registerBtn')
  const loginTitle   = document.getElementById('loginTitle')
  const tabResident  = document.getElementById('tab-resident')
  const tabAdmin     = document.getElementById('tab-admin')
  const signinBtn    = document.getElementById('signinBtn')
  const togglePwdBtn = document.getElementById('togglePwd')

  // clear fields on load
  emailInput.value = ''
  pwdInput.value = ''

  // Tab switching 
  const setMode = mode => {
    currentMode = mode

    if (mode === 'resident') {
      tabResident.classList.add('active')
      tabResident.setAttribute('aria-selected', 'true')
      tabAdmin.classList.remove('active')
      tabAdmin.setAttribute('aria-selected', 'false')

      loginTitle.textContent = 'Resident Login'
      registerBtn.style.display = 'block'
    } else {
      tabAdmin.classList.add('active')
      tabAdmin.setAttribute('aria-selected', 'true')
      tabResident.classList.remove('active')
      tabResident.setAttribute('aria-selected', 'false')

      loginTitle.textContent = 'Admin Login'
      registerBtn.style.display = 'none'
    }
  }

  tabResident.addEventListener('click', () => setMode('resident'))
  tabAdmin.addEventListener('click', () => setMode('admin'))

  // default mode
  setMode('resident')

  // Toggle password visibility
  togglePwdBtn.addEventListener('click', () => {
    const isHidden = pwdInput.type === 'password'
    pwdInput.type = isHidden ? 'text' : 'password'
    togglePwdBtn.textContent = isHidden ? '🙈' : '👁️'
  })

  // Login handler
  signinBtn.addEventListener('click', async () => {
const email = emailInput.value.trim()
    const password = pwdInput.value

    if (!email || !password) {
      alert('Please enter both email and password')
      return
    }

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          role: currentMode
        })
      })

      if (res.ok) {
        if (currentMode === 'admin') {
          window.location.href = '/xavier.html'
        } else {
          window.location.href = '/home.html'
        }
      } else {
        const err = await res.json().catch(() => ({}))
        alert(err.message || 'Invalid login credentials')
      }
    } catch (e) {
      alert('Server unreachable. Try again later.')
    }
  })

  // Registration button (resident only)
  registerBtn.addEventListener('click', () => {
    // window.location.href = '/register.html'
    alert('Registration feature coming soon!')
  })
})