import styles from './Navbar.module.scss'

/**
 * Navbar
 * Cabecera pública con logotipo, enlaces y botones Entrar / Empieza ahora; menú en móvil.
 *
 * Props (proposal): —
 * Uses: Button · Stories: HU-07 · Level: Medio
 * Design reference: Brava design system and the Claude Design canvas.
 *
 * TODO: implement. Styles only with design tokens (var(--…)); accessible markup.
 */
export default function Navbar({ children, ...rest }) {
  return (
    <div className={styles.root} {...rest}>
      {children}
    </div>
  )
}
