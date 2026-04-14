self.addEventListener('message', (event) => {
  if (event.data.type === 'SCHEDULE_NOTIFICATION') {
    self.reminderTime = event.data.time // "HH:MM"
  }
})

// 1분마다 시간 체크
setInterval(() => {
  if (!self.reminderTime) return
  const now = new Date()
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  if (`${hh}:${mm}` === self.reminderTime) {
    self.registration.showNotification('민서맘 투두리스트 💕', {
      body: '오늘 할 일을 확인해보세요! 🌸',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
    })
  }
}, 60000)
