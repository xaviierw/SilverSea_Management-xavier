async function logOut() {
    try {
        await fetch('/api/logout', { method: 'POST' })
      } catch {}
      window.location.href = '/index.html'
    }
