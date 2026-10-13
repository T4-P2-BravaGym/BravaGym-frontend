/**
 * Portada
 * TODO(HU-07): build this page from components and load data through src/services.
 */
import { useEffect, useState } from 'react'
import HomeHero from '@/components/domain/HomeHero'
import { isPersonalTrainingSession, listSessions, toSessionCard } from '@/services/sessions'
import HomeFeatures from '@/components/domain/HomeFeatures'

export default function Home() {
  const [nextSession, setNextSession] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    listSessions({
      from: new Date().toISOString(),
      only_available: true,
      size: 10,
      signal: controller.signal,
    })
      .then((data) => {
        const groupClass = data.items.find((session) => !isPersonalTrainingSession(session))
        setNextSession(groupClass ? toSessionCard(groupClass) : null)
      })
      .catch(() => {
        setNextSession(null)
      })

    return () => controller.abort()
  }, [])
  
  return (
  <>
    <HomeHero nextSession={nextSession} />
    <HomeFeatures />
  </>
    
  )
}
