/**
 * Mi cuenta (#101): an admin or superadmin changes her own details and password.
 */
import PageHeader from '@/components/ui/PageHeader'
import AccountSections from '@/pages/shared/Account'
import styles from './AdminAccount.module.scss'

export default function AdminAccount() {
  return (
    <section className={styles.root}>
      <PageHeader eyebrow="Administración" title="Mi cuenta" lead="Tus datos y tu contraseña." />
      <AccountSections />
    </section>
  )
}