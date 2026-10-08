import { useId, useState } from 'react'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import { centsToEurosInput, eurosToCents } from '@/utils/format'
import styles from './ProductForm.module.scss'

export default function ProductForm({ product, categories, busy = false, error, onSubmit, onCancel }) {
    const headingId = useId()
    const [form, setForm] = useState(() => toFormValues(product))
    const isEdit = Boolean(product?.id)

    function update(name) {
        return (event) => setForm((current) => ({ ...current, [name]: event.target.value }))
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
                </div>

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
    return {
        name: product?.name ?? '',
        category_id: product?.category_id ? String(product.category_id) : '',
        price: centsToEurosInput(product?.price_cents),
        stock: product ? String(product.stock) : '0',
        description: product?.description ?? '',
    }
}

function toNumberOrRaw(text) {
    if (text.trim() === '') return null
    const value = Number(text)
    return Number.isFinite(value) ? value : text
}

function toProductBody(form) {
    return {
        name: form.name,
        category_id: toNumberOrRaw(form.category_id),
        price_cents: eurosToCents(form.price),
        stock: toNumberOrRaw(form.stock),
        description: form.description.trim() ? form.description : null,
    }
}