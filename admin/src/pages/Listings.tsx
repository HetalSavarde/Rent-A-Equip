import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Trash2, ExternalLink } from 'lucide-react'
import api from '../lib/api'
import { ConfirmModal } from '../components/ConfirmModal'
import { Toast } from '../components/Toast'
import { useToast } from '../hooks/useToast'

interface Listing {
  id: number
  title: string
  category: string
  location: string
  daily_rate: number
  available_quantity: number
  status: string
  created_at: string
  owner: { full_name: string; email: string }
}

type StatusFilter = 'all' | 'active' | 'paused' | 'retired'

export default function ListingsPage() {
  const qc = useQueryClient()
  const { toasts, showToast } = useToast()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [confirmDelete, setConfirmDelete] = useState<Listing | null>(null)

  const { data: listings = [], isLoading } = useQuery<Listing[]>({
    queryKey: ['admin-listings'],
    queryFn: async () => (await api.get('/admin/listings')).data,
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => api.delete(`/admin/listings/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-listings'] })
      showToast('Listing deleted', 'success')
    },
    onError: () => showToast('Delete failed', 'error'),
  })

  const categories = ['all', ...Array.from(new Set(listings.map((l) => l.category).filter(Boolean)))]

  const filtered = listings.filter((l) => {
    const q = search.toLowerCase()
    const matchSearch =
      l.title?.toLowerCase().includes(q) ||
      l.category?.toLowerCase().includes(q) ||
      l.location?.toLowerCase().includes(q) ||
      l.owner?.full_name?.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || l.status === statusFilter
    const matchCategory = categoryFilter === 'all' || l.category === categoryFilter
    return matchSearch && matchStatus && matchCategory
  })

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      active: 'badge-green',
      paused: 'badge-amber',
      retired: 'badge-gray',
    }
    return `badge ${map[status] ?? 'badge-gray'}`
  }

  const statusTabs: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'paused', label: 'Paused' },
    { key: 'retired', label: 'Retired' },
  ]

  return (
    <div className="p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Listings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {listings.length} total listings on platform
          </p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, category, location…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {statusTabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
                statusFilter === key
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === 'all' ? 'All categories' : c}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading listings…</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Listing</th>
                <th>Category</th>
                <th>Lister</th>
                <th>Location</th>
                <th>Daily rate</th>
                <th>Qty</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center text-muted-foreground py-8">
                    No listings found
                  </td>
                </tr>
              ) : (
                filtered.map((listing) => (
                  <tr key={listing.id}>
                    <td className="font-medium max-w-[160px] truncate">{listing.title}</td>
                    <td>
                      <span className="badge badge-blue">{listing.category || '—'}</span>
                    </td>
                    <td className="text-sm text-muted-foreground">
                      {listing.owner?.full_name || '—'}
                    </td>
                    <td className="text-sm text-muted-foreground max-w-[120px] truncate">
                      {listing.location || '—'}
                    </td>
                    <td className="font-mono text-sm">
                      ₹{listing.daily_rate?.toLocaleString('en-IN')}
                    </td>
                    <td className="text-center">{listing.available_quantity ?? '—'}</td>
                    <td>
                      <span className={statusBadge(listing.status)}>{listing.status}</span>
                    </td>
                    <td className="text-xs text-muted-foreground">
                      {new Date(listing.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <a
                          href={`http://localhost:5173/listings/${listing.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
                          title="View listing"
                        >
                          <ExternalLink size={13} />
                        </a>
                        <button
                          onClick={() => setConfirmDelete(listing)}
                          className="p-1.5 text-red-500 hover:text-red-700 rounded-md hover:bg-red-50 transition-colors"
                          title="Delete listing"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {confirmDelete && (
        <ConfirmModal
          title={`Delete "${confirmDelete.title}"?`}
          message="This will permanently delete the listing. Active rentals on this listing may be affected."
          confirmLabel="Delete listing"
          destructive
          onConfirm={() => {
            deleteMutation.mutate(confirmDelete.id)
            setConfirmDelete(null)
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} type={t.type} />
      ))}
    </div>
  )
}
