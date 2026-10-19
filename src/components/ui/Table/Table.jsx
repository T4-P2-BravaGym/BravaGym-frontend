import EmptyState from '@/components/ui/EmptyState'
import cx from '@/utils/cx'
import styles from './Table.module.scss'

/**
 * Table
 * Data table for the admin panels. It scrolls sideways inside its own box on phones.
 * Each column: { key, header, render?(row), align?: 'left' | 'right' }.
 *
 * Props: columns, rows, getRowKey, caption (read by screen readers), emptyTitle, emptyText
 */
export default function Table({
  columns,
  rows,
  getRowKey = (row) => row.id,
  caption,
  emptyTitle = 'No hay datos',
  emptyText,
}) {
  if (!rows?.length) return <EmptyState title={emptyTitle} text={emptyText} />

  return (
    <div className={styles.scroll}>
      <table className={styles.root}>
        {caption && <caption className={styles.caption}>{caption}</caption>}
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col" className={cx(column.align === 'right' && styles.right)}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)}>
              {columns.map((column) => (
                <td key={column.key} className={cx(column.align === 'right' && styles.right)}>
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
