import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api/axios'

interface User {
  id: number
  full_name: string
  username: string
  email: string
}

interface Permissions {
  [moduleCode: string]: {
    READ: boolean
    CREATE: boolean
    UPDATE: boolean
    DELETE: boolean
  }
}

interface Menu {
  label: string
  url: string | null
  icon: string | null
  sort_order: number
  children: {
    label: string
    url: string | null
    icon: string | null
    sort_order: number
  }[]
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const permissions = ref<Permissions>({})
  const menus = ref<Menu[]>([])
  const isAuthenticated = ref(false)

  async function login(email: string, password: string) {
    const res = await api.post('/auth/login', { email, password }, {
      headers: {
        'x-api-key': import.meta.env.VITE_API_KEY
      }
    })
    const data = res.data.data

    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('user_data', JSON.stringify(data.user))
    localStorage.setItem('menus_data', JSON.stringify(data.menus))
    localStorage.setItem('permissions_data', JSON.stringify(data.permissions))

    user.value = data.user
    permissions.value = data.permissions
    menus.value = data.menus
    isAuthenticated.value = true
  }

  function logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_data')
    localStorage.removeItem('menus_data')
    localStorage.removeItem('permissions_data')

    user.value = null
    permissions.value = {}
    menus.value = []
    isAuthenticated.value = false
  }

  function hasPermission(moduleCode: string, action: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE') {
    return permissions.value[moduleCode]?.[action] === true
  }

  function restoreFromToken() {
    const token = localStorage.getItem('access_token')
    if (!token) return false

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const isExpired = payload.exp * 1000 < Date.now()

      if (isExpired) {
        logout()
        return false
      }

      // Restore semua data dari localStorage
      const userData = localStorage.getItem('user_data')
      const menusData = localStorage.getItem('menus_data')
      const permissionsData = localStorage.getItem('permissions_data')

      if (userData) user.value = JSON.parse(userData)
      if (menusData) menus.value = JSON.parse(menusData)
      if (permissionsData) permissions.value = JSON.parse(permissionsData)

      isAuthenticated.value = true
      return true
    } catch {
      logout()
      return false
    }
  }

  return {
    user,
    permissions,
    menus,
    isAuthenticated,
    login,
    logout,
    hasPermission,
    restoreFromToken
  }
})