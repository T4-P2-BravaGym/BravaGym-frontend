import { useState } from 'react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Chip from '@/components/ui/Chip'
import { formatEuros } from '@/utils/format'
import styles from './ProductCard.module.scss'

/**
 * ProductCard
 * A shop product with category, price and "Añadir", or "Agotado" when there is no stock.
 * Clothing with sizes shows them as chips: one has to be chosen before adding (RN-20),
 * and sold-out sizes are disabled. Without an image it shows a placeholder with the name.
 *
 * Props: product { id, name, category_name, price_cents, stock, sizes [{ size, stock }], image_url },
 *        busy, onAdd(product, size)  (size is null for products without sizes)
 */
export default function ProductCard({ product, busy = false, onAdd }) {
    const sizes = product.sizes ?? []
    const hasSizes = sizes.length > 0
    const [size, setSize] = useState(null)
    const soldOut = product.stock <= 0
    const needsSize = hasSizes && size === null

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

                {hasSizes && !soldOut && (
                    <div className={styles.sizes} role="group" aria-label={`Talla de ${product.name}`}>
                        {sizes.map((item) => {
                            const sizeSoldOut = item.stock <= 0
                            return (
                                <Chip
                                    key={item.size}
                                    className={styles.sizeChip}
                                    selected={size === item.size}
                                    disabled={sizeSoldOut || busy}
                                    aria-label={sizeSoldOut ? `${item.size}, agotada` : item.size}
                                    onClick={() => setSize(item.size)}
                                >
                                    {item.size}
                                </Chip>
                            )
                        })}
                    </div>
                )}

                <div className={styles.bottom}>
                    <span className={styles.price}>{formatEuros(product.price_cents)}</span>
                    {soldOut ? (
                        <Badge tone="neutral">Agotado</Badge>
                    ) : (
                        <Button
                            size="sm"
                            disabled={busy || needsSize}
                            onClick={() => onAdd?.(product, hasSizes ? size : null)}
                            aria-label={
                                needsSize
                                    ? `Elige una talla de ${product.name}`
                                    : `Añadir ${product.name}${size ? ` en talla ${size}` : ''} al carrito`
                            }
                        >
                            {needsSize ? 'Elige talla' : 'Añadir'}
                        </Button>
                    )}
                </div>
            </div>
        </article>
    )
}