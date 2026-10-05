import { useId, useRef } from 'react'
import cx from '@/utils/cx'
import styles from './Tabs.module.scss'

/**
 * Tabs
 * Accessible tabs (role="tablist"): the days of a routine, for example.
 * Arrow keys move between tabs. The panel shows `children` (the content of the active tab).
 * Each tab: { id, label }.
 *
 * Props: tabs, active, onChange(id), label (what the tabs choose), action (extra button after the tabs), children
 */
export default function Tabs({ tabs, active, onChange, label, action, children }) {
  const baseId = useId()
  const listRef = useRef(null)

  function handleKeyDown(event) {
    const index = tabs.findIndex((tab) => tab.id === active)
    let next = null
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length
    if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length
    if (event.key === 'Home') next = 0
    if (event.key === 'End') next = tabs.length - 1
    if (next === null) return
    event.preventDefault()
    onChange(tabs[next].id)
    listRef.current?.querySelectorAll('[role="tab"]')[next]?.focus()
  }

  return (
    <div className={styles.root}>
      <div className={styles.bar}>
        <div ref={listRef} role="tablist" aria-label={label} className={styles.list} onKeyDown={handleKeyDown}>
          {tabs.map((tab) => {
            const selected = tab.id === active
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`${baseId}-tab-${tab.id}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel`}
                tabIndex={selected ? 0 : -1}
                className={cx(styles.tab, selected && styles.isSelected)}
                onClick={() => onChange(tab.id)}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
        {action}
      </div>
      <div
        role="tabpanel"
        id={`${baseId}-panel`}
        aria-labelledby={`${baseId}-tab-${active}`}
        className={styles.panel}
      >
        {children}
      </div>
    </div>
  )
}
