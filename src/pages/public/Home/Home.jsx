import { useEffect, useState } from 'react'
import HomeFeatures from '@/components/domain/HomeFeatures'
import HomeHero from '@/components/domain/HomeHero'
import HomeMarquee from '@/components/domain/HomeMarquee'
import { isPersonalTrainingSession, listSessions, toSessionCard } from '@/services/sessions'
import { listTrainers } from '@/services/trainers'

export default function Home() {
  const [nextSession, setNextSession] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    Promise.all([
      listSessions({
        from: new Date().toISOString(),
        only_available: true,
        size: 10,
        signal: controller.signal,
      }),
      listTrainers({ signal: controller.signal }).catch(() => []),
    ])
        .then(([data, trainers]) => {
          const groupClass = data.items.find((session) => !isPersonalTrainingSession(session))
          if (!groupClass) {
            setNextSession(null)
            return
          }
          const trainer = trainers.find((item) => item.id === groupClass.trainer_id)
          setNextSession({ ...toSessionCard(groupClass), trainer_name: trainer?.name ?? null })
        })
        .catch(() => {
          setNextSession(null)
        })

    return () => controller.abort()
  }, [])

  return (
      <>
        <HomeHero nextSession={nextSession} />
        <HomeMarquee />
        <HomeFeatures />
      </>
  )
}