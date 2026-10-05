import { useState } from 'react'
import Alert from '@/components/ui/Alert'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Chip from '@/components/ui/Chip'
import EmptyState from '@/components/ui/EmptyState'
import Field from '@/components/ui/Field'
import Modal from '@/components/ui/Modal'
import Pagination from '@/components/ui/Pagination'
import Spinner from '@/components/ui/Spinner'
import Table from '@/components/ui/Table'
import Tabs from '@/components/ui/Tabs'
import CancellationRequestCard from '@/components/domain/CancellationRequestCard'
import CapacityBar from '@/components/domain/CapacityBar'
import CartSummary from '@/components/domain/CartSummary'
import DiscountCodeInput from '@/components/domain/DiscountCodeInput'
import ExerciseRow from '@/components/domain/ExerciseRow'
import PricingCard from '@/components/domain/PricingCard'
import ProductCard from '@/components/domain/ProductCard'
import RoutineEditor from '@/components/domain/RoutineEditor'
import SessionCard from '@/components/domain/SessionCard'
import StatCard from '@/components/domain/StatCard'
import TrainerCard from '@/components/domain/TrainerCard'
import WeekSchedule from '@/components/domain/WeekSchedule'
import SideNav from '@/components/layout/SideNav'
import { NAVIGATION } from '@/routes/navigation'
import { PATHS } from '@/routes/paths'
import { formatDateTime, formatEuros } from '@/utils/format'
import * as sample from './sampleData'
import styles from './ComponentGallery.module.scss'

/**
 * Component gallery: every component with its variants, using example data.
 * For reviewing pull requests and for the demo. Remove the route before the final delivery
 * if you do not want it public.
 */
export default function ComponentGallery() {
  const [chip, setChip] = useState('lun')
  const [tab, setTab] = useState(1)
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [cart, setCart] = useState(sample.CART)
  const [discount, setDiscount] = useState(null)

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Brava · frontend</p>
        <h1 className={styles.title}>Componentes</h1>
        <p className={styles.lead}>
          Todas las piezas con sus variantes. Los datos son de ejemplo: no son socias, precios ni clases reales.
        </p>
      </header>

      <h2 className={styles.group}>Piezas base</h2>

      <Section name="Button" path="ui/Button">
        <div className={styles.row}>
          <Button>Reservar</Button>
          <Button variant="secondary">Ver horario</Button>
          <Button variant="dark">Unirme a la lista</Button>
          <Button variant="quiet">Ver mis reservas</Button>
          <Button variant="danger">Cancelar clase</Button>
          <Button size="sm">Pagar 59,00 €</Button>
          <Button disabled>Ya no se puede cancelar</Button>
          <Button to={PATHS.pricing} variant="secondary">
            Enlace a precios
          </Button>
        </div>
      </Section>

      <Section name="Badge" path="ui/Badge">
        <div className={styles.row}>
          {['confirmed', 'waitlisted', 'cancelled', 'paid', 'pending', 'failed', 'refunded', 'active', 'approved', 'rejected'].map((status) => (
            <Badge key={status} status={status} />
          ))}
          <Badge tone="brand">+5,00 €</Badge>
          <Badge tone="solid">La más elegida</Badge>
        </div>
      </Section>

      <Section name="Chip" path="ui/Chip">
        <div className={styles.row} role="group" aria-label="Día de ejemplo">
          {['lun', 'mar', 'mié', 'jue'].map((d) => (
            <Chip key={d} selected={chip === d} onClick={() => setChip(d)}>
              {d}
            </Chip>
          ))}
        </div>
      </Section>

      <Section name="Field" path="ui/Field">
        <div className={styles.grid3}>
          <Field label="Email" type="email" placeholder="tu@email.com" hint="Lo usarás para entrar." />
          <Field label="Código de descuento" defaultValue="VERANO" error="Este código caducó el 31 de agosto." />
          <Field label="Clase" as="select" defaultValue="">
            <option value="">Todas</option>
            <option>Fuerza básica</option>
            <option>Movilidad</option>
          </Field>
          <Field label="Motivo de la baja" as="textarea" rows={3} placeholder="Cuéntanos por qué…" />
        </div>
      </Section>

      <Section name="Card" path="ui/Card">
        <div className={styles.grid3}>
          <Card eyebrow="Tu plan" title="Completo">
            <span>
              <Badge status="active" />
            </span>
            <span className={styles.muted}>Próxima cuota: 1 de noviembre</span>
          </Card>
          <Card variant="tint" eyebrow="Pagos pendientes" title="1 · 59,00 €">
            <span>Cuota de octubre</span>
          </Card>
          <Card variant="dark" eyebrow="Próxima clase" title="Fuerza básica">
            <span>Hoy · 18:00 · con Nora</span>
          </Card>
        </div>
      </Section>

      <Section name="Modal" path="ui/Modal">
        <Button variant="secondary" onClick={() => setModalOpen(true)}>
          Abrir confirmación
        </Button>
        <Modal
          open={modalOpen}
          title="¿Cancelar la reserva?"
          description="Fuerza básica, hoy a las 18:00. Tu plaza pasará a la primera persona de la lista de espera."
          confirmLabel="Sí, cancelar"
          cancelLabel="No, mantenerla"
          tone="danger"
          onConfirm={() => setModalOpen(false)}
          onClose={() => setModalOpen(false)}
        />
      </Section>

      <Section name="Table · Pagination" path="ui/Table · ui/Pagination">
        <Table
          caption="Pagos de ejemplo"
          columns={[
            { key: 'member', header: 'Socia', render: (row) => <strong>{row.member}</strong> },
            { key: 'concept', header: 'Concepto' },
            { key: 'created_at', header: 'Fecha', render: (row) => formatDateTime(row.created_at) },
            { key: 'amount', header: 'Importe', align: 'right', render: (row) => formatEuros(row.final_amount_cents) },
            { key: 'status', header: 'Estado', render: (row) => <Badge status={row.status} /> },
          ]}
          rows={sample.PAYMENTS}
        />
        <Pagination page={page} size={4} total={10} onChange={setPage} />
        <Table columns={[{ key: 'x', header: 'X' }]} rows={[]} emptyTitle="No hay pagos con estos filtros" emptyText="Prueba con otras fechas o estados." />
      </Section>

      <Section name="Tabs" path="ui/Tabs">
        <Tabs
          label="Días de ejemplo"
          tabs={[
            { id: 1, label: 'Día 1' },
            { id: 2, label: 'Día 2' },
            { id: 3, label: 'Día 3' },
          ]}
          active={tab}
          onChange={setTab}
        >
          <p className={styles.muted}>Contenido del día {tab}.</p>
        </Tabs>
      </Section>

      <Section name="Spinner · EmptyState · Alert · Avatar" path="ui/…">
        <div className={styles.stack}>
          <Spinner />
          <EmptyState
            title="Aún no tienes rutina"
            text="Tu entrenadora te la preparará después de tu primera sesión."
            action={<Button variant="secondary">Ver horario</Button>}
          />
          <Alert tone="success" title="Reserva confirmada">
            Fuerza básica, hoy a las 18:00.
          </Alert>
          <Alert tone="warning">Estás en la lista de espera: te avisaremos si queda una plaza.</Alert>
          <Alert tone="error" title="No se ha podido cancelar" onClose={() => {}}>
            Falta menos de 1 hora para la clase.
          </Alert>
          <Alert tone="info">Puedes cancelar hasta 1 hora antes de la clase.</Alert>
          <div className={styles.row}>
            <Avatar name="Marta Ruiz" size="sm" />
            <Avatar name="Nora Gil" />
            <Avatar name="Irene Sol" size="lg" />
            <Avatar name="Carla Mas" tone="champagne" />
          </div>
        </div>
      </Section>

      <h2 className={styles.group}>Piezas de Brava</h2>

      <Section name="SessionCard" path="domain/SessionCard" note="Con plazas, completa, reservada a menos de 1 hora, lista de espera, precio extra y cancelada.">
        <div className={styles.grid4}>
          {sample.SESSIONS.slice(0, 4).map((session) => (
            <SessionCard key={session.id} session={session} booking={sample.BOOKINGS[session.id]} now={sample.NOW} />
          ))}
          <SessionCard session={{ ...sample.SESSIONS[0], id: 99, free_spots: 0 }} now={sample.NOW} />
          <SessionCard session={sample.SESSIONS[7]} now={sample.NOW} />
        </div>
      </Section>

      <Section name="WeekSchedule" path="domain/WeekSchedule">
        <WeekSchedule sessions={sample.SESSIONS} bookings={sample.BOOKINGS} now={sample.NOW} />
      </Section>

      <Section name="CapacityBar · StatCard" path="domain/CapacityBar · domain/StatCard">
        <div className={styles.stack}>
          <CapacityBar taken={8} capacity={12} />
          <CapacityBar taken={12} capacity={12} />
        </div>
        <div className={styles.grid3}>
          <StatCard label="Pagos pendientes" value={7} to={PATHS.adminPayments} linkLabel="Revisar" />
          <StatCard label="Bajas por revisar" value={2} to={PATHS.adminCancellations} linkLabel="Ver solicitudes" tone="tint" />
          <StatCard label="Socias activas" value={48} />
        </div>
      </Section>

      <Section name="PricingCard" path="domain/PricingCard">
        <div className={styles.grid3}>
          {sample.PLANS.map((plan) => (
            <PricingCard key={plan.id} plan={plan} features={sample.PLAN_FEATURES[plan.id]} featured={plan.id === 2} onSelect={() => {}} />
          ))}
          <PricingCard plan={sample.PLANS[1]} features={sample.PLAN_FEATURES[2]} current />
        </div>
      </Section>

      <Section name="TrainerCard" path="domain/TrainerCard">
        <div className={styles.grid3}>
          {sample.TRAINERS.map((trainer) => (
            <TrainerCard key={trainer.id} trainer={trainer} to={PATHS.personalTraining} />
          ))}
        </div>
      </Section>

      <Section name="ProductCard · CartSummary" path="domain/ProductCard · domain/CartSummary">
        <div className={styles.grid3}>
          {sample.PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} onAdd={() => {}} />
          ))}
        </div>
        <CartSummary
          items={cart}
          onChangeQuantity={(id, quantity) => setCart((items) => items.map((i) => (i.product_id === id ? { ...i, quantity } : i)))}
          onRemove={(id) => setCart((items) => items.filter((i) => i.product_id !== id))}
          onCheckout={() => {}}
        />
      </Section>

      <Section name="DiscountCodeInput" path="domain/DiscountCodeInput" note="Prueba BRAVA10 (válido) o cualquier otro (error).">
        <DiscountCodeInput
          applied={discount}
          onRemove={() => setDiscount(null)}
          onApply={async (code) => {
            if (code !== 'BRAVA10') throw new Error('Este código no existe o ya no es válido.')
            setDiscount({ code, percent_off: 10 })
          }}
        />
      </Section>

      <Section name="ExerciseRow" path="domain/ExerciseRow">
        <ol className={styles.list}>
          {sample.ROUTINE_LINES.map((line) => (
            <ExerciseRow key={line.position} line={line} />
          ))}
        </ol>
      </Section>

      <Section name="RoutineEditor" path="domain/RoutineEditor">
        <RoutineEditor members={sample.MEMBERS} exercises={sample.EXERCISES} initialRoutine={sample.INITIAL_ROUTINE} onSave={() => {}} />
      </Section>

      <Section name="CancellationRequestCard" path="domain/CancellationRequestCard">
        <div className={styles.grid2}>
          {sample.REQUESTS.map((request) => (
            <CancellationRequestCard key={request.id} request={request} onApprove={() => {}} onReject={() => {}} />
          ))}
        </div>
      </Section>

      <h2 className={styles.group}>Navegación</h2>

      <Section name="SideNav" path="layout/SideNav" note="Navbar, Footer y MobileTabBar se ven en las páginas públicas y en el móvil.">
        <div className={styles.sideNavDemo}>
          <SideNav area={NAVIGATION.admin} user={{ name: 'Carla Mas', roleLabel: 'Administración' }} />
        </div>
      </Section>
    </div>
  )
}

function Section({ name, path, note, children }) {
  return (
    <section className={styles.section} aria-label={name}>
      <div className={styles.sectionHead}>
        <h3 className={styles.sectionTitle}>{name}</h3>
        <code className={styles.path}>{path}</code>
      </div>
      {note && <p className={styles.muted}>{note}</p>}
      <div className={styles.sectionBody}>{children}</div>
    </section>
  )
}
