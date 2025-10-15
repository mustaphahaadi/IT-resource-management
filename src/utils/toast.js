export const showSuccess = (message) => {
  const toast = document.createElement('div')
  toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in'
  toast.textContent = message
  document.body.appendChild(toast)
  setTimeout(() => {
    toast.classList.add('animate-fade-out')
    setTimeout(() => document.body.removeChild(toast), 300)
  }, 3000)
}

export const showError = (message) => {
  const toast = document.createElement('div')
  toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in'
  toast.textContent = message
  document.body.appendChild(toast)
  setTimeout(() => {
    toast.classList.add('animate-fade-out')
    setTimeout(() => document.body.removeChild(toast), 300)
  }, 3000)
}
