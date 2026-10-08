import { useId, useState } from 'react'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import Modal from '@/components/ui/Modal'
import Spinner from '@/components/ui/Spinner'
import Table from '@/components/ui/Table'
import { createCategory, deleteCategory, updateCategory } from '@/services/shop'
import { adminErrorMessage } from './errors'
import styles from './AdminProducts.module.scss'

const SAVE_ERROR = 'No se ha podido guardar la categoría. Inténtalo de nuevo.'
const DELETE_ERROR = 'No se ha podido borrar la categoría. Inténtalo de nuevo.'
const CATEGORY_HINT = 'Escribe un nombre de 60 caracteres como máximo.'

export default function CategoriesTab({ categories, onChanged }) {
    const headingId = useId()
    const [renaming, setRenaming] = useState(null)
    const [name, setName] = useState('')
    const [formError, setFormError] = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [busy, setBusy] = useState(false)
    const [flash, setFlash] = useState(null)
    const [actionError, setActionError] = useState(null)

    function clearMessages() {
        setFlash(null)
        setActionError(null)
        setFormError(null)
    }

    function startRename(category) {
        clearMessages()
        setRenaming(category)
        setName(category.name)
    }

    function resetForm() {
        setRenaming(null)
        setName('')
        setFormError(null)
    }

    async function handleSubmit(event) {
        event.preventDefault()
        clearMessages()
        setBusy(true)
        try {
            if (renaming) {
                const saved = await updateCategory(renaming.id, { name })
                setFlash(`Categoría renombrada a «${saved.name}».`)
            } else {
                const saved = await createCategory({ name })
                setFlash(`Categoría «${saved.name}» creada.`)
            }
            resetForm()
            await onChanged()
        } catch (error) {
            setFormError(adminErrorMessage(error, { fallback: SAVE_ERROR, invalidHint: CATEGORY_HINT }))
        } finally {
            setBusy(false)
        }
    }

    async function handleDelete() {
        clearMessages()
        setBusy(true)
        try {
            await deleteCategory(deleteTarget.id)
            setFlash(`Categoría «${deleteTarget.name}» borrada.`)
            if (renaming?.id === deleteTarget.id) resetForm()
            await onChanged()
        } catch (error) {
            setActionError(adminErrorMessage(error, { fallback: DELETE_ERROR }))
        } finally {
            setDeleteTarget(null)
            setBusy(false)
        }
    }

    const columns = [
        { key: 'name', header: 'Categoría', render: (category) => <span className={styles.cellName}>{category.name}</span> },
        {
            key: 'actions',
            header: 'Acciones',
            align: 'right',
            render: (category) => (
                <div className={styles.rowActions}>
                    <Button variant="secondary" size="sm" onClick={() => startRename(category)} disabled={busy}>
                        Renombrar
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setDeleteTarget(category)} disabled={busy}>
                        Borrar
                    </Button>
                </div>
            ),
        },
    ]

    return (
        <div className={styles.tab}>
            <section className={styles.formSection} aria-labelledby={headingId}>
                <h2 id={headingId} className={styles.sectionTitle}>
                    {renaming ? `Renombrar «${renaming.name}»` : 'Nueva categoría'}
                </h2>

                {formError && (
                    <Alert tone="error" title={formError.title}>
                        {formError.text}
                    </Alert>
                )}

                <form className={styles.inlineForm} onSubmit={handleSubmit} noValidate>
                    <Field
                        label="Nombre de la categoría"
                        name="name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        disabled={busy}
                    />
                    <div className={styles.formActions}>
                        {renaming && (
                            <Button variant="secondary" onClick={resetForm} disabled={busy}>
                                Cancelar
                            </Button>
                        )}
                        <Button type="submit" disabled={busy}>
                            {busy ? 'Guardando…' : renaming ? 'Guardar nombre' : 'Añadir categoría'}
                        </Button>
                    </div>
                </form>
            </section>

            {flash && (
                <Alert tone="success" onClose={() => setFlash(null)}>
                    {flash}
                </Alert>
            )}
            {actionError && (
                <Alert tone="error" title={actionError.title} onClose={() => setActionError(null)}>
                    {actionError.text}
                </Alert>
            )}

            {categories === null ? (
                <Spinner label="Cargando categorías…" />
            ) : (
                <Table
                    caption="Categorías de la tienda"
                    columns={columns}
                    rows={categories}
                    emptyTitle="Aún no hay categorías"
                    emptyText="Crea una para poder dar de alta productos."
                />
            )}

            <Modal
                open={Boolean(deleteTarget)}
                title="¿Borrar esta categoría?"
                description={
                    deleteTarget
                        ? `Vas a borrar «${deleteTarget.name}». Solo se puede si no tiene productos, ni activos ni desactivados.`
                        : undefined
                }
                confirmLabel="Borrar"
                tone="danger"
                busy={busy}
                onConfirm={handleDelete}
                onClose={() => setDeleteTarget(null)}
            />
        </div>
    )
}