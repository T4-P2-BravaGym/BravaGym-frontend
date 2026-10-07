import { useState } from 'react'
import Alert from '@/components/ui/Alert'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Chip from '@/components/ui/Chip'
import EmptyState from '@/components/ui/EmptyState'
import Field from '@/components/ui/Field'
import Icon, { ICON_NAMES } from '@/components/ui/Icon'
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
import Footer from '@/components/layout/Footer'
import Navbar from '@/components/layout/Navbar'
import SideNav from '@/components/layout/SideNav'
import SubscriptionCard from '@/components/domain/SubscriptionCard'
import { NAVIGATION } from '@/routes/navigation'
import { PATHS } from '@/routes/paths'
import { formatDateTime, formatEuros } from '@/utils/format'
import * as sample from './sampleData'
import styles from './Sandbox.module.scss'

/**
 * Live examples for the sandbox page, keyed by the `id` of each entry in catalog.js.
 * Each demo keeps its own state, so they can be tried without affecting each other.
 */

function ButtonDemo() {
  return (
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
  )
}

function BadgeDemo() {
  const statuses = ['confirmed', 'waitlisted', 'cancelled', 'paid', 'pending', 'failed', 'refunded', 'active', 'expired', 'approved', 'rejected']
  return (
    <div className={styles.row}>
      {statuses.map((status) => (
        <span key={status} className={styles.labelled}>
          <Badge status={status} />
          <code className={styles.caption}>{status}</code>
        </span>
      ))}
      <span className={styles.labelled}>
        <Badge tone="brand">+5,00 €</Badge>
        <code className={styles.caption}>tone="brand"</code>
      </span>
      <span className={styles.labelled}>
        <Badge tone="solid">La más elegida</Badge>
        <code className={styles.caption}>tone="solid"</code>
      </span>
    </div>
  )
}

function ChipDemo() {
  const [day, setDay] = useState('lun')
  return (
    <div className={styles.row} role="group" aria-label="Día de ejemplo">
      {['lun', 'mar', 'mié', 'jue', 'vie'].map((d) => (
        <Chip key={d} selected={day === d} onClick={() => setDay(d)}>
          {d}
        </Chip>
      ))}
    </div>
  )
}

function FieldDemo() {
  return (
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
  )
}

function CardDemo() {
  return (
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
  )
}

function ModalDemo() {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Abrir confirmación
      </Button>
      <Modal
        open={open}
        title="¿Cancelar la reserva?"
        description="Fuerza básica, hoy a las 18:00. Tu plaza pasará a la primera persona de la lista de espera."
        confirmLabel="Sí, cancelar"
        cancelLabel="No, mantenerla"
        tone="danger"
        onConfirm={() => setOpen(false)}
        onClose={() => setOpen(false)}
      />
    </div>
  )
}

const PAYMENT_COLUMNS = [
  { key: 'member', header: 'Socia', render: (row) => <strong>{row.member}</strong> },
  { key: 'concept', header: 'Concepto' },
  { key: 'created_at', header: 'Fecha', render: (row) => formatDateTime(row.created_at) },
  { key: 'amount', header: 'Importe', align: 'right', render: (row) => formatEuros(row.final_amount_cents) },
  { key: 'status', header: 'Estado', render: (row) => <Badge status={row.status} /> },
]

function TableDemo() {
  return (
    <>
      <Table caption="Pagos de ejemplo" columns={PAYMENT_COLUMNS} rows={sample.PAYMENTS} />
      <p className={styles.muted}>Sin filas:</p>
      <Table columns={PAYMENT_COLUMNS} rows={[]} emptyTitle="No hay pagos con estos filtros" emptyText="Prueba con otras fechas o estados." />
    </>
  )
}

function PaginationDemo() {
  const [page, setPage] = useState(1)
  return <Pagination page={page} size={20} total={48} onChange={setPage} />
}

function TabsDemo() {
  const [tab, setTab] = useState(1)
  return (
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
  )
}

function SpinnerDemo() {
  return (
    <div className={styles.row}>
      <Spinner />
      <Spinner label="Guardando la rutina…" />
    </div>
  )
}

function EmptyStateDemo() {
  return (
    <div className={styles.stack}>
      <EmptyState
        title="Aún no tienes rutina"
        text="Tu entrenadora te la preparará después de tu primera sesión."
        action={<Button variant="secondary">Ver horario</Button>}
      />
    </div>
  )
}

function AlertDemo() {
  return (
    <div className={styles.stack}>
      <Alert tone="success" title="Reserva confirmada">
        Fuerza básica, hoy a las 18:00.
      </Alert>
      <Alert tone="warning">Estás en la lista de espera: te avisaremos si queda una plaza.</Alert>
      <Alert tone="error" title="No se ha podido cancelar" onClose={() => {}}>
        Falta menos de 1 hora para la clase.
      </Alert>
      <Alert tone="info">Puedes cancelar hasta 1 hora antes de la clase.</Alert>
    </div>
  )
}

function AvatarDemo() {
  return (
    <div className={styles.row}>
      <Avatar name="Marta Ruiz" size="sm" />
      <Avatar name="Nora Gil" />
      <Avatar name="Irene Sol" size="lg" />
      <Avatar name="Carla Mas" tone="champagne" />
    </div>
  )
}

function IconDemo() {
  return (
    <div className={styles.iconGrid}>
      {ICON_NAMES.map((name) => (
        <span key={name} className={styles.labelled}>
          <Icon name={name} size={24} />
          <code className={styles.caption}>{name}</code>
        </span>
      ))}
    </div>
  )
}

function SessionCardDemo() {
  return (
    <div className={styles.grid4}>
      {sample.SESSIONS.slice(0, 4).map((session) => (
        <SessionCard key={session.id} session={session} booking={sample.BOOKINGS[session.id]} now={sample.NOW} />
      ))}
      <SessionCard session={{ ...sample.SESSIONS[0], id: 99, free_spots: 0 }} now={sample.NOW} />
      <SessionCard session={sample.SESSIONS[7]} now={sample.NOW} />
    </div>
  )
}

function WeekScheduleDemo() {
  return <WeekSchedule sessions={sample.SESSIONS} bookings={sample.BOOKINGS} now={sample.NOW} />
}

function CapacityBarDemo() {
  return (
    <div className={styles.stack}>
      <CapacityBar taken={8} capacity={12} />
      <CapacityBar taken={12} capacity={12} />
    </div>
  )
}

function StatCardDemo() {
  return (
    <div className={styles.grid3}>
      <StatCard label="Pagos pendientes" value={7} to={PATHS.adminPayments} linkLabel="Revisar" />
      <StatCard label="Bajas por revisar" value={2} to={PATHS.adminCancellations} linkLabel="Ver solicitudes" tone="tint" />
      <StatCard label="Socias activas" value={48} />
    </div>
  )
}

function PricingCardDemo() {
  return (
    <div className={styles.grid3}>
      {sample.PLANS.map((plan) => (
        <PricingCard key={plan.id} plan={plan} features={sample.PLAN_FEATURES[plan.id]} featured={plan.id === 2} onSelect={() => {}} />
      ))}
      <PricingCard plan={sample.PLANS[1]} features={sample.PLAN_FEATURES[2]} current />
    </div>
  )
}

function SubscriptionCardDemo() {
    return (
        <div className={styles.grid3}>
            <SubscriptionCard subscription={sample.MY_SUBSCRIPTION} paymentsTo={PATHS.myPayments} />
            <SubscriptionCard subscription={null} pricingTo={PATHS.pricing} />
        </div>
    )
}

function TrainerCardDemo() {
  return (
    <div className={styles.grid3}>
      {sample.TRAINERS.map((trainer) => (
        <TrainerCard key={trainer.id} trainer={trainer} to={PATHS.personalTraining} />
      ))}
    </div>
  )
}

function ProductCardDemo() {
  return (
    <div className={styles.grid3}>
      {sample.PRODUCTS.map((product) => (
        <ProductCard key={product.id} product={product} onAdd={() => {}} />
      ))}
    </div>
  )
}

function CartSummaryDemo() {
  const [cart, setCart] = useState(sample.CART)
  return (
    <CartSummary
      items={cart}
      onChangeQuantity={(id, quantity) => setCart((items) => items.map((i) => (i.product_id === id ? { ...i, quantity } : i)))}
      onRemove={(id) => setCart((items) => items.filter((i) => i.product_id !== id))}
      onCheckout={() => {}}
    />
  )
}

function DiscountCodeInputDemo() {
  const [discount, setDiscount] = useState(null)
  return (
    <>
      <p className={styles.muted}>Prueba BRAVA10 (válido) o cualquier otro (error).</p>
      <DiscountCodeInput
        applied={discount}
        onRemove={() => setDiscount(null)}
        onApply={async (code) => {
          if (code !== 'BRAVA10') throw new Error('Este código no existe o ya no es válido.')
          setDiscount({ code, percent_off: 10 })
        }}
      />
    </>
  )
}

function ExerciseRowDemo() {
  return (
    <ol className={styles.list}>
      {sample.ROUTINE_LINES.map((line) => (
        <ExerciseRow key={line.position} line={line} />
      ))}
    </ol>
  )
}

function RoutineEditorDemo() {
  return <RoutineEditor members={sample.MEMBERS} exercises={sample.EXERCISES} initialRoutine={sample.INITIAL_ROUTINE} onSave={() => {}} />
}

function CancellationRequestCardDemo() {
  return (
    <div className={styles.grid2}>
      {sample.REQUESTS.map((request) => (
        <CancellationRequestCard key={request.id} request={request} onApprove={() => {}} onReject={() => {}} />
      ))}
    </div>
  )
}

function NavbarDemo() {
  return (
    <div className={styles.frame}>
      <Navbar />
    </div>
  )
}

function FooterDemo() {
  return (
    <div className={styles.frame}>
      <Footer />
    </div>
  )
}

function SideNavDemo() {
  return (
    <div className={styles.sideNavDemo}>
      <SideNav area={NAVIGATION.admin} user={{ name: 'Carla Mas', roleLabel: 'Administración' }} />
    </div>
  )
}

function MobileTabBarDemo() {
  return <p className={styles.muted}>Solo aparece en el móvil, abajo del todo. Para verla, entra en {PATHS.member} y estrecha la ventana.</p>
}

function PublicLayoutDemo() {
  return <p className={styles.muted}>Lo ves en cualquier página pública, por ejemplo {PATHS.pricing}.</p>
}

function PrivateLayoutDemo() {
  return (
    <p className={styles.muted}>
      Lo ves en {PATHS.member}, {PATHS.trainerSessions} o {PATHS.admin}. Sin login, pon VITE_DEV_SKIP_AUTH=true en tu .env.
    </p>
  )
}

export const DEMOS = {
  button: ButtonDemo,
  badge: BadgeDemo,
  chip: ChipDemo,
  field: FieldDemo,
  card: CardDemo,
  modal: ModalDemo,
  table: TableDemo,
  pagination: PaginationDemo,
  tabs: TabsDemo,
  spinner: SpinnerDemo,
  'empty-state': EmptyStateDemo,
  alert: AlertDemo,
  avatar: AvatarDemo,
  icon: IconDemo,
  'session-card': SessionCardDemo,
  'week-schedule': WeekScheduleDemo,
  'capacity-bar': CapacityBarDemo,
  'stat-card': StatCardDemo,
  'pricing-card': PricingCardDemo,
  'subscription-card': SubscriptionCardDemo,
  'trainer-card': TrainerCardDemo,
  'product-card': ProductCardDemo,
  'cart-summary': CartSummaryDemo,
  'discount-code-input': DiscountCodeInputDemo,
  'exercise-row': ExerciseRowDemo,
  'routine-editor': RoutineEditorDemo,
  'cancellation-request-card': CancellationRequestCardDemo,
  navbar: NavbarDemo,
  footer: FooterDemo,
  'side-nav': SideNavDemo,
  'mobile-tab-bar': MobileTabBarDemo,
  'public-layout': PublicLayoutDemo,
  'private-layout': PrivateLayoutDemo,
}
