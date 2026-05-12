import { useEffect, useState } from 'react'

export function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine)
  useEffect(() => {
    function on() { setOnline(true) }
    function off() { setOnline(false) }
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  if (online) return null
  return (
    <div className="bg-amber-100 px-3 py-2 text-center text-xs text-amber-800">
      You're offline. Connect to wifi to save new changes.
    </div>
  )
}
