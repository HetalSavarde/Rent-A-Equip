import { useEffect, useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Users, Package, Activity, AlertTriangle,
  DollarSign, FileWarning, RefreshCw, Zap,
} from 'lucide-react'
import api from '../lib/api'
import { Toast } from '../components/Toast'
import { useToast } from '../hooks/useToast'

interface DashboardData {
  total_users: number
  total_listings: number
  active_rentals: number
  overdue_rentals: number
  total_fines_unpaid: number
  damage_reports_pending: number
}

export default function DashboardPage() {
  const { toasts, showToast } = useToast()
  const [lastRefreshed, setLastRefreshed] = useState(new Date())

  const { data, isLoading, refetch } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get('/admin/dashboard')
      return res.data
    },
    refetchInterval: 60_000,
  })

  useEffect(() => {
    setLastRefreshed(new Date())
  }, [data])

  const fineCheck = useMutation({
    mutationFn: async () => {
      const res = await api.post('/admin/run-fine-check')
      return res.data
    },
    onSuccess: (d) => {
      showToast(`Fine check done — ${d.fines_created} fine(s) created`, 'success')
      refetch()
    },
    onError: () => showToast('Fine check failed', 'error'),
  })

  const fmt = (n?: number) => n?.toLocaleString('en-IN') ?? '—'
  const fmtCurrency = (n?: number) =>
    n != null ? `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'

  const stats = [
    {
      label: 'Total users',
      value: fmt(data?.total_users),
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      signal: '',
      to: '/users',
    },
    {
      label: 'Total listings',
      value: fmt(data?.total_listings),
      icon: Package,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      signal: '',
      to: '/listings',
    },
    {
      label: 'Active rentals',
      value: fmt(data?.active_rentals),
      icon: Activity,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      signal: (data?.active_rentals ?? 0) > 0 ? 'green' : '',
      to: '/rentals',
    },
    {
      label: 'Overdue rentals',
      value: fmt(data?.overdue_rentals),
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      signal: (data?.overdue_rentals ?? 0) > 0 ? 'red' : '',
      to: '/rentals',
    },
    {
      label: 'Unpaid fines',
      value: fmtCurrency(data?.total_fines_unpaid),
      icon: DollarSign,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      signal: (data?.total_fines_unpaid ?? 0) > 0 ? 'amber' : '',
      to: '/fines',
    },
    {
      label: 'Pending damage reports',
      value: fmt(data?.damage_reports_pending),
      icon: FileWarning,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      signal: (data?.damage_reports_pending ?? 0) > 0 ? 'red' : '',
      to: '/damage',
    },
  ]

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Last refreshed {lastRefreshed.toLocaleTimeString()} · auto-refreshes every 60s
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { refetch(); setLastRefreshed(new Date()) }}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <button
            onClick={() => fineCheck.mutate()}
            disabled={fineCheck.isPending}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors font-medium"
          >
            <Zap size={14} />
            {fineCheck.isPending ? 'Running…' : 'Run fine check'}
          </button>
        </div>
      </div>

      {/* Stats grid */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="stat-card animate-pulse">
              <div className="h-4 w-24 bg-muted rounded mb-3" />
              <div className="h-7 w-16 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, color, bg, signal, to }) => (
            <Link
              key={label}
              to={to}
              className="stat-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 group"
            >
              <div className="flex items-start justify-between">
                <span className="text-sm text-muted-foreground">{label}</span>
                <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                  <Icon size={15} className={color} />
                </div>
              </div>
              <div className="flex items-end gap-2 mt-1">
                <span className="text-2xl font-semibold tracking-tight">{value}</span>
                {signal === 'red' && (
                  <span className="badge badge-red mb-1">Needs attention</span>
                )}
                {signal === 'amber' && (
                  <span className="badge badge-amber mb-1">Unpaid</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Quick nav */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Quick navigation</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { to: '/users', label: 'Manage users' },
            { to: '/listings', label: 'Review listings' },
            { to: '/rentals', label: 'View rentals' },
            { to: '/fines', label: 'Check fines' },
            { to: '/damage', label: 'Damage reports' },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} type={t.type} />
      ))}
    </div>
  )
}
