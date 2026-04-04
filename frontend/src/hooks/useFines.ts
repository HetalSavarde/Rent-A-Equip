import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import type { Fine } from '../types/api'

export const useMyFines = () => {
  return useQuery({
    queryKey: ['my-fines'],
    queryFn: async () => {
      const response = await api.get<Fine[]>('/fines/my')
      return response.data
    }
  })
}

export const useMyListingFines = () => {
  return useQuery({
    queryKey: ['listing-fines'],
    queryFn: async () => {
      const response = await api.get<Fine[]>('/fines/my/listing-fines')
      return response.data
    }
  })
}

export const usePayFine = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (fineId: string) => {
      const response = await api.patch<Fine>(`/fines/${fineId}/pay`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-fines'] })
      queryClient.invalidateQueries({ queryKey: ['listing-fines'] })
    }
  })
}