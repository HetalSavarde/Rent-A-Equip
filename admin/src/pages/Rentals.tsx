import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, ChevronDown, ChevronUp } from 'lucide-react'
import api from '../lib/api'

interface Rental {
  id: string
  listing: { title: string }
  borrower: { full_name: string; email: string }
  lister: { full_name: string; email: string }
  start_date: string
  due_date: string
  returned_date?: string
  status: string
  created_at: string
  quantity: number
  total_amount?: number
}

type StatusFilter = 'all' | 'pending' | 'active' | 'returned' | 'overdue' | 'cancelled'

const STATUS_STYLES: Record<string, string> = {
  pending: 'badge-amber',
  active: 'badge-green',
  returned: 'badge-gray',
  overdue: 'badge-red',
  cancelled: 'badge-gray',
}

export default function RentalsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { data: rentals = [], isLoading } = useQuery<Rental[]>({
    queryKey: ['admin-rentals'],
    queryFn: async () => (await api.get('/rentals/all')).data,
  })

  const statusCounts = rentals.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1
    return acc
  }, {})

  const filtered = rentals.filter((r) => {
    const q = search.toLowerCase()
    const matchSearch =
      r.listing?.title?.toLowerCase().includes(q) ||
      r.borrower?.full_name?.toLowerCase().includes(q) ||
      r.lister?.full_name?.toLowerCase().includes(q) ||
      r.id?.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    return matchSearch && matchStatus
  })

  const statusTabs: StatusFilter[] = ['all', 'pending', 'active', 'overdue', 'returned', 'cancelled']

  const shortId = (id: string) => id?.slice(0, 8).toUpperCase() || '—'

  const fmt = (d?: string) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

  return (
    <div className="p-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Rentals</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {rentals.length} total rentals · read-only view
        </p>
      </div>

      {/* Status pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {statusTabs.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              statusFilter === s
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border bg-card hover:bg-muted'
            }`}
          >
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            {s !== 'all' && statusCounts[s] != null && (
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                statusFilter === s ? 'bg-white/20' : 'bg-muted'
              }`}>
                {statusCounts[s]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-xs mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search listing, borrower, lister…"
          className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading rentals…</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Rental ID</th>
                <th>Listing</th>
                <th>Borrower</th>
                <th>Lister</th>
                <th>Start</th>
                <th>Due</th>
                <th>Returned</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center text-muted-foreground py-8">
                    No rentals found
                  </td>
                </tr>
              ) : (
                filtered.map((rental) => (
                  <>
                    <tr
                      key={rental.id}
                      className="cursor-pointer"
                      onClick={() =>
                        setExpandedId(expandedId === rental.id ? null : rental.id)
                      }
                    >
                      <td className="font-mono text-xs text-muted-foreground">
                        {shortId(rental.id)}
                      </td>
                      <td className="font-medium max-w-[140px] truncate">
                        {rental.listing?.title || '—'}
                      </td>
                      <td className="text-sm text-muted-foreground">
                        {rental.borrower?.full_name || '—'}
                      </td>
                      <td className="text-sm text-muted-foreground">
                        {rental.lister?.full_name || '—'}
                      </td>
                      <td className="text-xs">{fmt(rental.start_date)}</td>
                      <td className="text-xs">{fmt(rental.due_date)}</td>
                      <td className="text-xs">{fmt(rental.returned_date)}</td>
                      <td>
                        <span className={`badge ${STATUS_STYLES[rental.status] ?? 'badge-gray'}`}>
                          {rental.status}
                        </span>
                      </td>
                      <td>
                        {expandedId === rental.id ? (
                          <ChevronUp size={14} className="text-muted-foreground" />
                        ) : (
                          <ChevronDown size={14} className="text-muted-foreground" />
                        )}
                      </td>
                    </tr>

                    {expandedId === rental.id && (
                      <tr key={`${rental.id}-detail`}>
                        <td colSpan={9} className="bg-muted/30 px-6 py-4">
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-xs text-muted-foreground mb-0.5">Full rental ID</div>
                              <div className="font-mono text-xs break-all">{rental.id}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-0.5">Quantity</div>
                              <div>{rental.quantity ?? '—'}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-0.5">Total amount</div>
                              <div className="font-medium">
                                {rental.total_amount != null
                                  ? `₹${rental.total_amount.toLocaleString('en-IN')}`
                                  : '—'}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-0.5">Created</div>
                              <div>{fmt(rental.created_at)}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-0.5">Borrower email</div>
                              <div className="text-muted-foreground">{rental.borrower?.email || '—'}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-0.5">Lister email</div>
                              <div className="text-muted-foreground">{rental.lister?.email || '—'}</div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
