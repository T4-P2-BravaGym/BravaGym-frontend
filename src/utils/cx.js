/** Joins class names, skipping empty values: cx(styles.root, isActive && styles.isActive) */
export default function cx(...classes) {
  return classes.filter(Boolean).join(' ')
}
