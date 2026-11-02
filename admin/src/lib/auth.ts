export const auth = {
  isLoggedIn(): boolean {
    return !!localStorage.getItem('admin_token') && localStorage.getItem('admin_role') === 'admin'
  },
  getToken(): string | null {
    return localStorage.getItem('admin_token')
  },
  getName(): string {
    return localStorage.getItem('admin_name') || 'Admin'
  },
  login(token: string, role: string, name: string) {
    localStorage.setItem('admin_token', token)
    localStorage.setItem('admin_role', role)
    localStorage.setItem('admin_name', name)
  },
  logout() {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_role')
    localStorage.removeItem('admin_name')
  },
}
