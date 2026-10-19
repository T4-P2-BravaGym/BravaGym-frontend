import styles from './PageHeader.module.scss'

/**
 * PageHeader
 * Top of a page: eyebrow, title (the page's only <h1>) and lead, with an optional action.
 * The action sits on the right on desktop and under the text on phones.
 *
 * Props: title, eyebrow, lead, action
 */
export default function PageHeader({ title, eyebrow, lead, action }) {
    return (
        <header className={styles.root}>
            <div className={styles.text}>
                {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
                <h1 className={styles.title}>{title}</h1>
                {lead && <p className={styles.lead}>{lead}</p>}
            </div>
            {action && <div className={styles.action}>{action}</div>}
        </header>
    )
}