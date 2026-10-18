import styles from './HomeMarquee.module.scss'

const LIFTS = ['Sentadilla', 'Peso muerto', 'Hip thrust', 'Press de banca', 'Remo con barra', 'Press militar', 'Zancadas', 'Dominadas']

export default function HomeMarquee() {
    return (
        <div className={styles.root} aria-hidden="true">
            <div className={styles.band}>
                <div className={styles.track}>
                    {[...LIFTS, ...LIFTS].map((lift, index) => (
                        <span key={`${lift}-${index}`} className={styles.item}>
              {lift}
            </span>
                    ))}
                </div>
            </div>
        </div>
    )
}