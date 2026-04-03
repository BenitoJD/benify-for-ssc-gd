'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { adminApi, AdminUser } from '@/lib/api/admin'
import { Search, ChevronLeft, ChevronRight, User, Shield } from 'lucide-react'

export default function AdminUsersPage() {
  const searchParams = useSearchParams()

  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchUsers = useCallback(async (searchTerm: string, pageNum: number) => {
    setIsLoading(true)
    setError('')
    try {
      const response = await adminApi.listUsers({
        page: pageNum,
        limit: 20,
        search: searchTerm || undefined,
      })
      setUsers(response.data)
      setTotalPages(response.meta.pages)
      setTotal(response.meta.total)
      setPage(pageNum)
    } catch (err) {
      setError('Failed to load users')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers(search, page)
  }, [fetchUsers, search, page])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchUsers(search, 1)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-[var(--text-main)] mb-2">Users</h1>
          <p className="font-bold text-[var(--text-muted)] text-sm uppercase tracking-widest">Manage platform users</p>
        </div>
        <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-lg border-2 border-[var(--border-light)]">
          {total.toLocaleString()} total users
        </div>
      </div>

      {/* Search */}
      <div className="card-brilliant p-4">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-12 pr-4 py-3 border-2 border-[var(--border-light)] rounded-2xl focus:ring-4 focus:ring-[var(--brilliant-blue)] focus:ring-opacity-20 focus:border-[var(--brilliant-blue)] outline-none transition-all font-semibold"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-[var(--text-main)] text-white font-bold rounded-2xl transition-all shadow-[0_4px_0_rgba(0,0,0,0.2)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none"
          >
            Search
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="card-brilliant overflow-hidden p-0">
        {isLoading ? (
          <div className="flex items-center justify-center p-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-black" />
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl text-sm font-bold">
              {error}
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-[var(--text-muted)] font-bold text-sm bg-gray-50/50">
            No users found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest bg-gray-50 border-b-2 border-[var(--border-light)]">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Subscription</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4">Last Login</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[var(--border-light)]">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 border-2 border-[var(--border-light)] rounded-2xl flex items-center justify-center shadow-sm">
                          <User className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-bold text-[var(--text-main)] text-[15px]">{user.name || '-'}</p>
                          <p className="text-sm font-semibold text-[var(--text-muted)]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] uppercase font-bold tracking-widest rounded border-2 ${
                          user.role === 'admin' || user.role === 'super_admin'
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                            : 'bg-gray-50 text-[var(--text-muted)] border-[var(--border-light)]'
                        }`}
                      >
                        {user.role === 'admin' || user.role === 'super_admin' ? (
                          <Shield className="w-3.5 h-3.5" />
                        ) : null}
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex px-3 py-1 text-[10px] uppercase font-bold tracking-widest rounded border-2 ${
                          user.subscription_status === 'premium'
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : user.subscription_status === 'cancelled'
                            ? 'bg-red-100 text-red-700 border-red-200'
                            : 'bg-gray-50 text-[var(--text-muted)] border-[var(--border-light)]'
                        }`}
                      >
                        {user.subscription_status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center before:w-2 before:h-2 before:rounded-full before:mr-2 text-[15px] font-bold ${
                          user.is_active
                            ? 'text-green-700 before:bg-green-500'
                            : 'text-red-700 before:bg-red-500'
                        }`}
                      >
                        {user.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-[15px] font-bold text-[var(--text-muted)]">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5 text-[15px] font-bold text-[var(--text-muted)]">
                      {user.last_login_at
                        ? new Date(user.last_login_at).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td className="px-6 py-5">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="px-4 py-2 bg-white border-2 border-[var(--border-light)] text-[var(--text-main)] font-bold rounded-xl transition-all shadow-[0_3px_0_var(--border-light)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none hover:bg-gray-50 text-sm whitespace-nowrap inline-block"
                      >
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-[var(--text-muted)]">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="p-3 bg-white border-2 border-[var(--border-light)] rounded-xl hover:-translate-y-0.5 active:translate-y-1 shadow-[0_4px_0_var(--border-light)] active:shadow-none transition-all disabled:opacity-50 disabled:pointer-events-none text-[var(--text-main)]"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="p-3 bg-white border-2 border-[var(--border-light)] rounded-xl hover:-translate-y-0.5 active:translate-y-1 shadow-[0_4px_0_var(--border-light)] active:shadow-none transition-all disabled:opacity-50 disabled:pointer-events-none text-[var(--text-main)]"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
