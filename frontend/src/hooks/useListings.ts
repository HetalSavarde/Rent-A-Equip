import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import type { Listing, ListingListResponse } from '../types/api'

export const useListings = (params?: {
  category?: string
  available?: boolean
  location?: string
  search?: string
  page?: number
  limit?: number
}) => {
  return useQuery({
    queryKey: ['listings', params],
    queryFn: async () => {
      const response = await api.get<ListingListResponse>('/listings', { params })
      return response.data
    }
  })
}

export const useListing = (id: string) => {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      const response = await api.get<Listing>(`/listings/${id}`)
      return response.data
    },
    enabled: !!id
  })
}

export const useMyListings = () => {
  return useQuery({
    queryKey: ['my-listings'],
    queryFn: async () => {
      const response = await api.get<Listing[]>('/listings/my')
      return response.data
    }
  })
}

export const useCreateListing = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      name: string
      category: string
      description?: string
      available_qty: number
      daily_rate: number
      location: string
      image_url?: string
    }) => {
      const response = await api.post<Listing>('/listings', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] })
      queryClient.invalidateQueries({ queryKey: ['my-listings'] })
    }
  })
}

export const useDeleteListing = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/listings/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] })
      queryClient.invalidateQueries({ queryKey: ['my-listings'] })
    }
  })
}