/**
 * Rutinas (HU-17)
 * Trainers create a routine for a member. This page loads members and exercises,
 * adapts them for RoutineEditor and sends the new routine to the API.
 */
import { useEffect, useState } from 'react'
import Alert from '@/components/ui/Alert'
import Spinner from '@/components/ui/Spinner'
import RoutineEditor from '@/components/domain/RoutineEditor'
import { createRoutine, listExercises } from '@/services/routines'
import { listMembers } from '@/services/users'
import Tabs from '@/components/ui/Tabs'
import RoutineHistory from '@/components/domain/RoutineHistory'
import styles from './TrainerRoutines.module.scss'

const VIEWS = [
  { id: 'new', label: 'Nueva rutina'},
  { id: 'history', label: 'Historial' },
]

export default function TrainerRoutines() {
  const [members, setMembers] = useState([])
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [savedMessage, setSavedMessage] = useState(null)
  const [editorKey, setEditorKey] = useState(0)
  const [view, setView] = useState('new')

  // Load members and exercises at the same time; cancel both if the page closes first
  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    Promise.all([listMembers({ signal }), listExercises({ signal })])
      .then(([memberList, exerciseList]) => {
        setMembers(memberList.map(toMemberOption))
        setExercises(exerciseList)
        setLoading(false)
      })
      .catch((err) => {
        if (err.name === 'AbortError') return // the page closed: nothing to show
        setLoadError(err.message)
        setLoading(false)
      })

    return () => controller.abort()
  }, [])

  async function handleSave(payload) {
    setSaving(true)
    setSaveError(null)
    setSavedMessage(null)
    try {
      const routine = await createRoutine(payload)
      const member = members.find((m) => m.id === routine.member_id)
      setSavedMessage(`Rutina "${routine.name}" guardada para ${member?.name ?? 'la socia'}.`)
      setEditorKey((key) => key + 1) // empty the form for the next routine
    } catch (err) {
      setSaveError(err.message) // the API message (404, 409, 422) in Spanish
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className={styles.root}>
      <h1 className={styles.title}>Rutinas</h1>

      {loading && <Spinner />}

      {loadError && (
        <Alert tone="error" title="No hemos podido cargar socias y ejercicios">
          {loadError}
        </Alert>
      )}

      {savedMessage && (
        <Alert tone="success" onClose={() => setSavedMessage(null)}>
          {savedMessage}
        </Alert>
      )}

      {!loading && !loadError && (
        <Tabs tabs={VIEWS} active={view} onChange={setView} label="Rutinas">
          <div hidden={view !== 'new'}>
            <RoutineEditor
            key={editorKey}
            members={members}
            exercises={exercises}
            busy={saving}
            error={saveError}
            onSave={handleSave}
            />
          </div>
          
          {view === 'history' && <RoutineHistory members={members} />}
        </Tabs>
      )}
      </section>
      )
}

// The API sends first_name and last_name; the editor only needs { id, name }
function toMemberOption({ id, first_name, last_name }) {
  return { id, name: `${first_name} ${last_name}` }
}