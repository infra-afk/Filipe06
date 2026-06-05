interface Column<T> {
  key: keyof T | string
  label: string
  render?: (row: T) => React.ReactNode
  align?: 'left' | 'right' | 'center'
}

interface DataTableProps<T> {
  title?: string
  columns: Column<T>[]
  data: T[]
  action?: React.ReactNode
}

export default function DataTable<T extends Record<string, unknown>>({ title, columns, data, action }: DataTableProps<T>) {
  return (
    <div className="table-container">
      {title && (
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          {action}
        </div>
      )}
      <table>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i} className={col.align === 'right' ? 'text-right' : ''}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, ri) => (
            <tr key={ri}>
              {columns.map((col, ci) => (
                <td key={ci} className={col.align === 'right' ? 'text-right' : ''}>
                  {col.render ? col.render(row) : String(row[col.key as keyof T] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
