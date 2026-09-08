export type PaginationInfo = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export function initialPagination(limit = 10, total = 0): PaginationInfo {
  return { page: 1, limit, total, totalPages: Math.ceil(total / limit) }
}

export function Pagination({
  pagination,
  onPageChange,
  className = "flex items-center justify-between text-sm",
}: {
  pagination: PaginationInfo
  onPageChange: (page: number) => void
  className?: string
}) {
  const { page, limit, total, totalPages } = pagination

  if (totalPages <= 1) return null

  return (
    <div className={className}>
      <span className="text-muted-foreground">
        Mostrando {(page - 1) * limit + 1}–{Math.min(page * limit, total)} de {total}
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="px-3 py-1 rounded-md border border-input hover:bg-muted disabled:opacity-50"
        >
          Anterior
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="px-3 py-1 rounded-md border border-input hover:bg-muted disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}
