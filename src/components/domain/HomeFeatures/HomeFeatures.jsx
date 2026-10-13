import styles from './HomeFeatures.module.scss'

const FEATURES = [
    {
        title: 'Grupos pequeños',
        text: 'Aforo limitado en cada clase, para que la entrenadora corrija tu técnica.',
    },
    {
        title: 'Todo desde la app',
        text: 'Reserva, entra en lista de espera y cancela hasta 1 hora antes de la clase.',
    },
    {
        title: 'Tu rutina, tu progreso',
        text: 'Tu entrenadora diseña tu rutina y la tienes siempre a mano en tu área personal.',
    }
]

export default function HomeFeatures() {
    return (
        <section className={styles.root} aria-labelledby="home-features-title">
            <h2 id="home-features-title" className={styles.hiddenTitle}>
                Por qué Brava
            </h2>

            <ul className={styles.list}>
                {FEATURES.map((feature) => (
                    <li key={feature.title} className={styles.item}>
                        <h3 className={styles.title}>{feature.title}</h3>
                        <p className={styles.text}>{feature.text}</p>
                    </li>
                ))}
            </ul>
        </section>
    )
}