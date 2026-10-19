import { useEffect, useMemo, useState } from 'react'
import Badge from '@/components/ui/Badge'
import { COMPONENTS, GROUPS, NEEDS, importLine } from './catalog'
import { DEMOS } from './demos'
import styles from './Sandbox.module.scss'

const BY_ID = Object.fromEntries(COMPONENTS.map((entry) => [entry.id, entry]))

/** Lowercase without accents, so "menu" finds "Menú". */
function normalize(text = '') {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

function matches(entry, query) {
  if (!query) return true
  const haystack = normalize([entry.name, entry.use, entry.avoid, entry.props, entry.tip].join(' '))
  return normalize(query)
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word))
}

/** Renders `code` between backticks as <code>. */
function RichText({ children }) {
  return children.split('`').map((part, index) => (index % 2 ? <code key={index}>{part}</code> : part))
}

/**
 * Sandbox: every component with what it is for, when not to use it, its props,
 * the import line and a live example. Search it before creating a new component.
 * The content lives in catalog.js (texts) and demos.jsx (examples).
 */
export default function Sandbox() {
  const [query, setQuery] = useState('')
  const visible = useMemo(() => COMPONENTS.filter((entry) => matches(entry, query)), [query])

  // Keep the browser title meaningful while the page is open.
  useEffect(() => {
    const previous = document.title
    document.title = 'Sandbox · Brava'
    return () => {
      document.title = previous
    }
  }, [])

  return (
    <div className={styles.root}>
      <aside className={styles.index}>
        <a href="#top" className={styles.logo}>
          brava<span className={styles.dot}>.</span> <span className={styles.logoTag}>sandbox</span>
        </a>

        <label className={styles.search}>
          <span className={styles.searchLabel}>Buscar componente</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ej. botón, filtro, error, tabla…"
            className={styles.searchInput}
          />
        </label>

        <nav aria-label="Componentes" className={styles.indexNav}>
          {GROUPS.map((group) => {
            const items = visible.filter((entry) => entry.group === group.id)
            if (!items.length) return null
            return (
              <div key={group.id} className={styles.indexGroup}>
                <span className={styles.indexTitle}>{group.title}</span>
                <ul className={styles.indexList}>
                  {items.map((entry) => (
                    <li key={entry.id}>
                      <a href={`#${entry.id}`} className={styles.indexLink}>
                        {entry.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </nav>
      </aside>

      <main className={styles.main} id="top">
        <header className={styles.header}>
          <p className={styles.eyebrow}>Brava · frontend</p>
          <h1 className={styles.title}>Sandbox de componentes</h1>
          <p className={styles.lead}>
            Antes de crear un componente nuevo, búscalo aquí. Cada ficha dice para qué sirve, cuándo no usarlo, sus props y la
            línea para importarlo. Los datos de los ejemplos son inventados.
          </p>
        </header>

        {!query && <QuickGuide />}

        {visible.length === 0 && (
          <div className={styles.noResults}>
            <strong>No hay ningún componente para «{query}».</strong>
            <span>Prueba con otra palabra. Si de verdad falta, coméntalo con el equipo antes de crearlo.</span>
          </div>
        )}

        {GROUPS.map((group) => {
          const items = visible.filter((entry) => entry.group === group.id)
          if (!items.length) return null
          return (
            <section key={group.id} className={styles.group} aria-labelledby={`group-${group.id}`}>
              <div className={styles.groupHead}>
                <h2 id={`group-${group.id}`} className={styles.groupTitle}>
                  {group.title}
                </h2>
                <p className={styles.muted}>
                  <code>src/{group.folder}</code> · {group.text}
                </p>
              </div>
              {items.map((entry) => (
                <ComponentEntry key={entry.id} entry={entry} />
              ))}
            </section>
          )
        })}
      </main>
    </div>
  )
}

function QuickGuide() {
  return (
    <section className={styles.guide} aria-labelledby="guide-title">
      <h2 id="guide-title" className={styles.guideTitle}>
        ¿Qué necesitas?
      </h2>
      <dl className={styles.guideList}>
        {NEEDS.map((item) => (
          <div key={item.need} className={styles.guideRow}>
            <dt>{item.need}</dt>
            <dd>
              {item.ids.map((id, index) => (
                <span key={id}>
                  {index > 0 && ' + '}
                  <a href={`#${id}`}>{BY_ID[id].name}</a>
                </span>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function ComponentEntry({ entry }) {
  const Demo = DEMOS[entry.id]
  return (
    <article id={entry.id} className={styles.entry} aria-labelledby={`${entry.id}-title`}>
      <div className={styles.entryHead}>
        <h3 id={`${entry.id}-title`} className={styles.entryTitle}>
          {entry.name}
        </h3>
        <Badge tone="neutral">{GROUPS.find((group) => group.id === entry.group).title}</Badge>
      </div>

      <dl className={styles.facts}>
        <div>
          <dt>Úsalo para</dt>
          <dd>
            <RichText>{entry.use}</RichText>
          </dd>
        </div>
        {entry.avoid && (
          <div>
            <dt>No lo uses para</dt>
            <dd>
              <RichText>{entry.avoid}</RichText>
            </dd>
          </div>
        )}
        <div>
          <dt>Props</dt>
          <dd>
            <code className={styles.props}>{entry.props}</code>
          </dd>
        </div>
        {entry.tip && (
          <div>
            <dt>Ojo</dt>
            <dd>
              <RichText>{entry.tip}</RichText>
            </dd>
          </div>
        )}
      </dl>

      <ImportLine text={importLine(entry)} />

      {Demo && (
        <div className={styles.demo}>
          <Demo />
        </div>
      )}
    </article>
  )
}

function ImportLine({ text }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return undefined
    const timer = setTimeout(() => setCopied(false), 1800)
    return () => clearTimeout(timer)
  }, [copied])

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch {
      // Clipboard not available (http, old browser): the text can still be selected by hand.
    }
  }

  return (
    <div className={styles.importLine}>
      <code>{text}</code>
      <button type="button" className={styles.copy} onClick={copy}>
        {copied ? 'Copiado' : 'Copiar'}
      </button>
    </div>
  )
}
