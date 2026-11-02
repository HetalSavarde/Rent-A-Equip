import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, CheckCircle, AlertTriangle } from 'lucide-react'
import api from '../lib/api'
import { ConfirmModal } from '../components/ConfirmModal'
import { Toast } from '../components/Toast'
import { useToast } from '../hooks/useToast'

interface DamageReport {
  id: number
  listing: { title: string }
  reported_by: { full_name: string; email: string }
  borrower: { full_name: string; email: string }
  description: string
  status: string
  created_at: string
  rental_id?: string
}

type Filter = 'all' | 'pending' | 'resolved'

export default function DamagePage() {
  const qc = useQueryClient()
  const { toasts, showToast } = useToast()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [confirmResolve, setConfirmResolve] = useState<DamageReport | null>(null)

  const { data: reports = [], isLoading } = useQuery<DamageReport[]>({
    queryKey: ['admin-damage'],
    queryFn: async () => (await api.get('/damage/all')).data,
  })

  const resolveMutation = useMutation({
    mutationFn: async (id: number) => api.patch(`/damage/${id}/resolve`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-damage'] })
      showToast('Report marked as resolved', 'success')
    },
    onError: () => showToast('Failed to resolve', 'error'),
  })

  const pendingCount = reports.filter((r) => r.status === 'pending').length

  const filtered = reports.filter((r) => {
    const q = search.toLowerCase()
    const matchSearch =
      r.listing?.title?.toLowerCase().includes(q) ||
      r.reported_by?.full_name?.toLowerCase().includes(q) ||
      r.borrower?.full_name?.toLowerCase().includes(q)
    const matchFilter =
      filter === 'all' || r.status === filter
    return matchSearch && matchFilter
  })

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Damage Reports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {reports.length} total reports
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-xl">
            <AlertTriangle size={15} className="text-red-600" />
            <span className="text-sm font-medium text-red-700">
              {pendingCount} pending {pendingCount === 1 ? 'report' : 'reports'}
            </span>
          </div>
        )}
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search listing or user…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {(['all', 'pending', 'resolved'] as Filter[]).map((f) => (
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
          <div className="p-8 text-center text-sm text-muted-foreground">Loading reports…</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Listing</th>
                <th>Reported by</th>
                <th>Borrower</th>
                <th>Description</th>
                <th>Status</th>
                <th>Filed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted-foreground py-8">
                    No damage reports found
                  </td>
                </tr>
              ) : (
                filtered.map((report) => (
                  <tr key={report.id}>
                    <td className="font-medium text-sm max-w-[120px] truncate">
                      {report.listing?.title || '—'}
                    </td>
                    <td>
                      <div className="text-sm">{report.reported_by?.full_name || '—'}</div>
                      <div className="text-xs text-muted-foreground">{report.reported_by?.email}</div>
                    </td>
                    <td>
                      <div className="text-sm">{report.borrower?.full_name || '—'}</div>
                      <div className="text-xs text-muted-foreground">{report.borrower?.email}</div>
                    </td>
                    <td className="max-w-[200px]">
                      {expandedId === report.id ? (
                        <div>
                          <p className="text-sm whitespace-pre-wrap">{report.description}</p>
                          <button
                            onClick={() => setExpandedId(null)}
                            className="text-xs text-primary mt-1 hover:underline"
                          >
                            Show less
                          </button>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm truncate max-w-[180px]">{report.description}</p>
                          {report.description?.length > 60 && (
                            <button
                              onClick={() => setExpandedId(report.id)}
                              className="text-xs text-primary mt-0.5 hover:underline"
                            >
                              Read more
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          report.status === 'resolved' ? 'badge-green' : 'badge-amber'
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="text-xs text-muted-foreground">
                      {new Date(report.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td>
                      {report.status === 'pending' && (
                        <button
                          onClick={() => setConfirmResolve(report)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                        >
                          <CheckCircle size={12} />
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {confirmResolve && (
        <ConfirmModal
          title="Mark as resolved?"
          message={`This will mark the damage report for "${confirmResolve.listing?.title}" as resolved. Only do this after handling the support email.`}
          confirmLabel="Mark resolved"
          destructive={false}
          onConfirm={() => {
            resolveMutation.mutate(confirmResolve.id)
            setConfirmResolve(null)
          }}
          onCancel={() => setConfirmResolve(null)}
        />
      )}

      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} type={t.type} />
      ))}
    </div>
  )
}
