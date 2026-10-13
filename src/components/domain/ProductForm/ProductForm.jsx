import { useId, useState } from 'react'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import { centsToEurosInput, eurosToCents } from '@/utils/format'
import styles from './ProductForm.module.scss'

const PRODUCT_SIZES = ['XS', 'S', 'M', 'L', 'XL']

/**
 * ProductForm
 * Create or edit a product (HU-22). Clothing can have sizes (HU-37, RN-20): then the
 * stock goes in each size and an empty size is not sold. Validation happens in the API.
 *
 * Props: product (null to create), categories, busy, error { title, text }, onSubmit(body), onCancel
 */
export default function ProductForm({ product, categories, busy = false, error, onSubmit, onCancel }) {
    const headingId = useId()
    const sizesHintId = useId()
    const [form, setForm] = useState(() => toFormValues(product))
    const isEdit = Boolean(product?.id)

    function update(name) {
        return (event) => setForm((current) => ({ ...current, [name]: event.target.value }))
    }

    function updateSize(size) {
        return (event) =>
            setForm((current) => ({ ...current, sizeStock: { ...current.sizeStock, [size]: event.target.value } }))
    }

    function toggleSizes(event) {
        const checked = event.target.checked
        setForm((current) => ({ ...current, hasSizes: checked }))
    }

    function handleSubmit(event) {
        event.preventDefault()
        onSubmit(toProductBody(form))
    }

    return (
        <section className={styles.root} aria-labelledby={headingId}>
            <h2 id={headingId} className={styles.title}>
                {isEdit ? `Editar «${product.name}»` : 'Nuevo producto'}
            </h2>

            {error && (
                <Alert tone="error" title={error.title}>
                    {error.text}
                </Alert>
            )}

            <form className={styles.form} onSubmit={handleSubmit} noValidate>
                <Field label="Nombre" name="name" value={form.name} onChange={update('name')} disabled={busy} />

                <Field
                    label="Categoría"
                    as="select"
                    name="category_id"
                    value={form.category_id}
                    onChange={update('category_id')}
                    disabled={busy}
                >
                    <option value="">Elige una categoría</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </Field>

                <div className={styles.row}>
                    <Field
                        label="Precio (€)"
                        name="price"
                        inputMode="decimal"
                        hint="Por ejemplo, 34,90"
                        value={form.price}
                        onChange={update('price')}
                        disabled={busy}
                    />
                    {!form.hasSizes && (
                        <Field
                            label="Stock"
                            name="stock"
                            type="number"
                            inputMode="numeric"
                            hint="Unidades disponibles"
                            value={form.stock}
                            onChange={update('stock')}
                            disabled={busy}
                        />
                    )}
                </div>

                <label className={styles.check}>
                    <input type="checkbox" checked={form.hasSizes} onChange={toggleSizes} disabled={busy} />
                    <span>Tiene tallas</span>
                </label>

                {form.hasSizes && (
                    <fieldset className={styles.sizes} aria-describedby={sizesHintId}>
                        <legend className={styles.legend}>Stock por talla</legend>
                        <p id={sizesHintId} className={styles.hint}>
                            Deja vacía una talla que no vendas. Si quitas una talla, deja de verse en la tienda.
                        </p>
                        <div className={styles.sizeGrid}>
                            {PRODUCT_SIZES.map((size) => (
                                <Field
                                    key={size}
                                    label={size}
                                    name={`stock-${size}`}
                                    type="number"
                                    inputMode="numeric"
                                    value={form.sizeStock[size]}
                                    onChange={updateSize(size)}
                                    disabled={busy}
                                />
                            ))}
                        </div>
                    </fieldset>
                )}

                <Field
                    label="Descripción (opcional)"
                    as="textarea"
                    name="description"
                    rows={3}
                    value={form.description}
                    onChange={update('description')}
                    disabled={busy}
                />

                <div className={styles.actions}>
                    <Button variant="secondary" onClick={onCancel} disabled={busy}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={busy}>
                        {busy ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear producto'}
                    </Button>
                </div>
            </form>
        </section>
    )
}

function toFormValues(product) {
    const sizes = product?.sizes ?? []
    return {
        name: product?.name ?? '',
        category_id: product?.category_id ? String(product.category_id) : '',
        price: centsToEurosInput(product?.price_cents),
        stock: product && !sizes.length ? String(product.stock) : '0',
        description: product?.description ?? '',
        hasSizes: sizes.length > 0,
        sizeStock: Object.fromEntries(
            PRODUCT_SIZES.map((size) => [size, String(sizes.find((item) => item.size === size)?.stock ?? '')]),
        ),
    }
}

function toNumberOrRaw(text) {
    if (text.trim() === '') return null
    const value = Number(text)
    return Number.isFinite(value) ? value : text
}

function toProductBody(form) {
    const body = {
        name: form.name,
        category_id: toNumberOrRaw(form.category_id),
        price_cents: eurosToCents(form.price),
        description: form.description.trim() ? form.description : null,
    }
    if (!form.hasSizes) return { ...body, stock: toNumberOrRaw(form.stock), sizes: [] }

    const sizes = PRODUCT_SIZES.filter((size) => form.sizeStock[size].trim() !== '').map((size) => ({
        size,
        stock: toNumberOrRaw(form.sizeStock[size]),
    }))
    return { ...body, sizes }
}