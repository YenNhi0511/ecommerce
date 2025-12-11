"use client"
import { useEffect } from 'react'

export default function TawkLoader() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const src = (process.env.NEXT_PUBLIC_TAWK_SRC as string) || 'https://embed.tawk.to/6939adeb065b14197bcafb50/1jc4kuos1'
      const s = document.createElement('script')
      s.type = 'text/javascript'
      s.async = true
      s.src = src
      s.charset = 'UTF-8'
      s.setAttribute('crossorigin', '*')
      document.body.appendChild(s)

      return () => {
        try { document.body.removeChild(s) } catch (e) { /* ignore */ }
      }
    } catch (err) {
      // swallow errors — widget is optional
      // eslint-disable-next-line no-console
      console.warn('TawkLoader failed to load', err)
    }
  }, [])

  return null
}
