/**
 * Entrenadoras
 * TODO(HU-15): build this page from components and load data through src/services.
 */
import TrainerCard from '@/components/domain/TrainerCard'

const TRAINERS = [
  { id: 1, name: 'Nora', specialty: 'Fuerza y técnica', bio: 'Para que pierdas el miedo a la barra y entiendas cada movimiento.' },
  { id: 2, name: 'Laura', specialty: 'Iniciación a la fuerza', bio: 'Tu primera rutina, paso a paso y a tu ritmo.' },
  { id: 3, name: 'Irene', specialty: 'Movilidad y halterofilia', bio: 'Movilidad, potencia y técnica olímpica para ir un paso más allá.' },
]

export default function Trainers() {
  return (
    <section>
      <h1>Entrenadoras</h1>
      {TRAINERS.map((trainer) => (
        <TrainerCard key={trainer.id} trainer={trainer} />
      ))}

    </section>
  )
}
