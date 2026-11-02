import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Shield, UserX, UserCheck, ChevronUp } from 'lucide-react'
import api from '../lib/api'
import { auth } from '../lib/auth'
import { ConfirmModal } from '../components/ConfirmModal'
import { Toast } from '../components/Toast'
import { useToast } from '../hooks/useToast'

interface User {
  id: number
  full_name: string
  email: string
  phone: string
  role: string
  is_suspended: boolean
  created_at: string
}

type Tab = 'all' | 'active' | 'suspended' | 'admins'

export default function UsersPage() {
  const qc = useQueryClient()
  const { toasts, showToast } = useToast()
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<Tab>('all')
  const [confirm, setConfirm] = useState<{
    title: string; message: string; label: string; destructive: boolean; onConfirm: () => void
  } | null>(null)

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['admin-users'],
    queryFn: async () => (await api.get('/admin/users')).data,
  })

  const suspendMutation = useMutation({
    mutationFn: async ({ id, suspended }: { id: number; suspended: boolean }) =>
      api.patch(`/admin/users/${id}/suspend`, { suspended }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      showToast('User updated', 'success')
    },
    onError: () => showToast('Action failed', 'error'),
  })

  const roleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: number; role: string }) =>
      api.patch(`/admin/users/${id}/role`, { role }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      showToast('Role updated', 'success')
    },
    onError: () => showToast('Action failed', 'error'),
  })

  const currentAdminEmail = localStorage.getItem('admin_name') // we stored name/email

  const filtered = users.filter((u) => {
    const matchSearch =
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    if (!matchSearch) return false
    if (tab === 'active') return !u.is_suspended
    if (tab === 'suspended') return u.is_suspended
    if (tab === 'admins') return u.role === 'admin'
    return true
  })

  const tabs: { key: Tab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'suspended', label: 'Suspended' },
    { key: 'admins', label: 'Admins' },
  ]

  function askSuspend(user: User) {
    setConfirm({
      title: user.is_suspended ? `Unsuspend ${user.full_name}?` : `Suspend ${user.full_name}?`,
      message: user.is_suspended
        ? 'This user will regain access to the platform.'
        : 'This user will be blocked from logging in.',
      label: user.is_suspended ? 'Unsuspend' : 'Suspend',
      destructive: !user.is_suspended,
      onConfirm: () => {
        suspendMutation.mutate({ id: user.id, suspended: !user.is_suspended })
        setConfirm(null)
      },
    })
  }

  function askRoleChange(user: User) {
    const toAdmin = user.role !== 'admin'
    setConfirm({
      title: toAdmin ? `Promote ${user.full_name} to admin?` : `Demote ${user.full_name} to user?`,
      message: toAdmin
        ? 'This user will have full admin access.'
        : 'This user will lose admin access.',
      label: toAdmin ? 'Make Admin' : 'Demote',
      destructive: false,
      onConfirm: () => {
        roleMutation.mutate({ id: user.id, role: toAdmin ? 'admin' : 'user' })
        setConfirm(null)
      },
    })
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{users.length} registered users</p>
        </div>
      </div>

      {/* Search + tabs */}
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
                tab === key ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading users…</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted-foreground py-8">
                    No users found
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user.id}>
                    <td className="font-medium">{user.full_name || '—'}</td>
                    <td className="text-muted-foreground">{user.email}</td>
                    <td className="text-muted-foreground font-mono text-xs">{user.phone || '—'}</td>
                    <td>
                      <span className={`badge ${user.role === 'admin' ? 'badge-purple' : 'badge-blue'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${user.is_suspended ? 'badge-red' : 'badge-green'}`}>
                        {user.is_suspended ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="text-muted-foreground text-xs">
                      {new Date(user.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => askSuspend(user)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                            user.is_suspended
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-red-50 text-red-700 hover:bg-red-100'
                          }`}
                        >
                          {user.is_suspended ? (
                            <><UserCheck size={12} /> Unsuspend</>
                          ) : (
                            <><UserX size={12} /> Suspend</>
                          )}
                        </button>
                        {/* Don't let admin demote themselves */}
                        {user.email !== currentAdminEmail && (
                          <button
                            onClick={() => askRoleChange(user)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg font-medium bg-muted hover:bg-muted/80 transition-colors"
                          >
                            {user.role === 'admin' ? (
                              <><ChevronUp size={12} className="rotate-180" /> Demote</>
                            ) : (
                              <><Shield size={12} /> Make Admin</>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {confirm && (
        <ConfirmModal
          title={confirm.title}
          message={confirm.message}
          confirmLabel={confirm.label}
          destructive={confirm.destructive}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} type={t.type} />
      ))}
    </div>
  )
}
