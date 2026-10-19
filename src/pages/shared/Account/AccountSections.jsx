/**
 * "Mis datos" and "Cambiar contraseña" together (#101): the same block for every role.
 */
import ChangePasswordForm from './ChangePasswordForm'
import MyDataForm from './MyDataForm'
import styles from './Account.module.scss'

export default function AccountSections() {
  return (
    <div className={styles.sections}>
      <MyDataForm />
      <ChangePasswordForm />
    </div>
  )
}
