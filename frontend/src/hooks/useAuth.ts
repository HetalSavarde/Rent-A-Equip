import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { saveAuth, clearAuth } from '../lib/auth'
import type { TokenResponse } from '../types/api'

export const useLogin = () => {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await api.post<TokenResponse>('/auth/login', data)
      return response.data
    },
    onSuccess: (data) => {
      saveAuth(data.access_token, data.role)
      if (data.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    }
  })
}

export const useRegister = () => {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (data: {
      name: string
      email: string
      password: string
      phone?: string
    }) => {
      const response = await api.post('/auth/register', data)
      return response.data
    },
    onSuccess: () => {
      navigate('/login')
    }
  })
}

export const useLogout = () => {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout')
    },
    onSuccess: () => {
      clearAuth()
      navigate('/')
    },
    onError: () => {
      clearAuth()
      navigate('/')
    }
  })
}