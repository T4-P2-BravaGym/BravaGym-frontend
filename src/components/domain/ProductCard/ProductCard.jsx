import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { formatEuros } from '@/utils/format'
import styles from './ProductCard.module.scss'

/**
 * ProductCard
 * A shop product with category, price and "Añadir", or "Agotado" when there is no stock.
 * Without an image it shows a placeholder block with the product name.
 *
 * Props: product { id, name, category_name, price_cents, stock, image_url }, busy, onAdd(product)
 */
export default function ProductCard({ product, busy = false, onAdd }) {
  const soldOut = product.stock <= 0

  return (
    <article className={styles.root}>
      {product.image_url ? (
        <img className={styles.image} src={product.image_url} alt="" loading="lazy" />
      ) : (
        <div className={styles.placeholder} aria-hidden="true">
          {product.name}
        </div>
      )}
      <div className={styles.body}>
        {product.category_name && <span className={styles.category}>{product.category_name}</span>}
        <h3 className={styles.name}>{product.name}</h3>
        <div className={styles.bottom}>
          <span className={styles.price}>{formatEuros(product.price_cents)}</span>
          {soldOut ? (
            <Badge tone="neutral">Agotado</Badge>
          ) : (
            <Button size="sm" disabled={busy} onClick={() => onAdd?.(product)} aria-label={`Añadir ${product.name} al carrito`}>
              Añadir
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}
