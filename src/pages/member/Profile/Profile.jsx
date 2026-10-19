/**
 * Mi perfil (HU-04, HU-32): my details and my password. The forms are shared with the
 * trainer and admin areas (#101).
 */
import PageHeader from '@/components/ui/PageHeader'
import AccountSections from '@/pages/shared/Account'
import styles from './Profile.module.scss'

export default function Profile() {
  return (
    <section className={styles.root}>
      <PageHeader title="Mi perfil" lead="Tus datos y tu contraseña." />
      <AccountSections />
    </section>
  )
}
