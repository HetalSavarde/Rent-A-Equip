import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, DollarSign } from 'lucide-react'
import api from '../lib/api'

interface Fine {
  id: number
  borrower: { full_name: string; email: string }
  listing: { title: string }
  amount: number
  days_overdue: number
  is_paid: boolean
  created_at: string
}

type Filter = 'all' | 'unpaid' | 'paid'

export default function FinesPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const { data: fines = [], isLoading } = useQuery<Fine[]>({
    queryKey: ['admin-fines'],
    queryFn: async () => (await api.get('/fines/all')).data,
  })

  const totalUnpaid = fines
    .filter((f) => !f.is_paid)
    .reduce((sum, f) => sum + f.amount, 0)
  const totalPaid = fines
    .filter((f) => f.is_paid)
    .reduce((sum, f) => sum + f.amount, 0)
  const unpaidCount = fines.filter((f) => !f.is_paid).length

  const filtered = fines.filter((f) => {
    const q = search.toLowerCase()
    const matchSearch =
      f.borrower?.full_name?.toLowerCase().includes(q) ||
      f.listing?.title?.toLowerCase().includes(q)
    const matchFilter =
      filter === 'all' ||
      (filter === 'unpaid' && !f.is_paid) ||
      (filter === 'paid' && f.is_paid)
    return matchSearch && matchFilter
  })

  const fmt = (n: number) =>
    `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Fines</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Platform-wide fine overview · read-only
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Unpaid fines</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <DollarSign size={15} className="text-red-600" />
            </div>
          </div>
          <div className="text-2xl font-semibold text-red-600 mt-1">{fmt(totalUnpaid)}</div>
          <div className="text-xs text-muted-foreground">{unpaidCount} outstanding</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Collected fines</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <DollarSign size={15} className="text-emerald-600" />
            </div>
          </div>
          <div className="text-2xl font-semibold text-emerald-600 mt-1">{fmt(totalPaid)}</div>
          <div className="text-xs text-muted-foreground">{fines.length - unpaidCount} paid</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total fines issued</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <DollarSign size={15} className="text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-semibold mt-1">{fines.length}</div>
          <div className="text-xs text-muted-foreground">all time</div>
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search borrower or listing…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {(['all', 'unpaid', 'paid'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors capitalize ${
                filter === f
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading fines…</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Borrower</th>
                <th>Listing</th>
                <th>Amount</th>
                <th>Days overdue</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted-foreground py-8">
                    No fines found
                  </td>
                </tr>
              ) : (
                filtered.map((fine) => (
                  <tr key={fine.id}>
                    <td>
                      <div className="font-medium text-sm">{fine.borrower?.full_name || '—'}</div>
                      <div className="text-xs text-muted-foreground">{fine.borrower?.email}</div>
                    </td>
                    <td className="text-sm">{fine.listing?.title || '—'}</td>
                    <td className="font-mono font-medium text-sm">{fmt(fine.amount)}</td>
                    <td>
                      <span className="badge badge-red">{fine.days_overdue}d</span>
                    </td>
                    <td>
                      <span className={`badge ${fine.is_paid ? 'badge-green' : 'badge-red'}`}>
                        {fine.is_paid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="text-xs text-muted-foreground">
                      {new Date(fine.created_at).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
