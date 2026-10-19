import Icon from '@/components/ui/Icon'
import cx from '@/utils/cx'
import styles from './Alert.module.scss'

const ICONS = { info: 'info', success: 'check', warning: 'alert', error: 'alert' }

/**
 * Alert
 * Message for the result of an action: the API's error (translated, never "409")
 * or a confirmation. Errors are announced at once (role="alert"), the rest politely.
 *
 * Props: tone ('info' | 'success' | 'warning' | 'error'), title, children, onClose
 */
export default function Alert({ tone = 'info', title, children, onClose }) {
  return (
    <div className={cx(styles.root, styles[tone])} role={tone === 'error' ? 'alert' : 'status'}>
      <span className={styles.icon}>
        <Icon name={ICONS[tone]} />
      </span>
      <div className={styles.body}>
        {title && <p className={styles.title}>{title}</p>}
        {children && <div className={styles.text}>{children}</div>}
      </div>
      {onClose && (
        <button type="button" className={styles.close} onClick={onClose} aria-label="Cerrar aviso">
          <Icon name="x" size={18} />
        </button>
      )}
    </div>
  )
}
