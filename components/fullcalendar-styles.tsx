'use client'

import { useEffect } from 'react'

export function FullCalendarStyles() {
  useEffect(() => {
    // Check if links already exist
    const existingLinks = document.querySelectorAll(
      'link[data-fullcalendar="true"]'
    )
    if (existingLinks.length > 0) return

    // Add FullCalendar CSS links
    const links = [
      {
        href: 'https://cdn.jsdelivr.net/npm/@fullcalendar/core@6.1.19/main.min.css',
        id: 'fullcalendar-core-css'
      },
      {
        href: 'https://cdn.jsdelivr.net/npm/@fullcalendar/daygrid@6.1.19/main.min.css',
        id: 'fullcalendar-daygrid-css'
      },
      {
        href: 'https://cdn.jsdelivr.net/npm/@fullcalendar/timegrid@6.1.19/main.min.css',
        id: 'fullcalendar-timegrid-css'
      }
    ]

    links.forEach(({ href, id }) => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = href
      link.id = id
      link.setAttribute('data-fullcalendar', 'true')
      document.head.appendChild(link)
    })

    // Cleanup function
    return () => {
      links.forEach(({ id }) => {
        const link = document.getElementById(id)
        if (link) {
          link.remove()
        }
      })
    }
  }, [])

  return null
}
