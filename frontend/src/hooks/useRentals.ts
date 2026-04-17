import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import type { Rental, RentalReturnResponse } from '../types/api'

export const useMyBorrowingRentals = (status?: string) => {
  return useQuery({
    queryKey: ['borrowing-rentals', status],
    queryFn: async () => {
      const response = await api.get<Rental[]>('/rentals/my/borrowing', {
        params: status ? { status } : {}
      })
      return response.data
    }
  })
}

export const useMyListingRequests = (status?: string) => {
  return useQuery({
    queryKey: ['listing-requests', status],
    queryFn: async () => {
      const response = await api.get<Rental[]>('/rentals/my/listing-requests', {
        params: status ? { status } : {}
      })
      return response.data
    }
  })
}

export const useRequestRental = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      listing_id: string
      quantity: number
      start_date: string
      due_date: string
    }) => {
      const response = await api.post<Rental>('/rentals', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borrowing-rentals'] })
      queryClient.invalidateQueries({ queryKey: ['listings'] })
    }
  })
}

export const useAcceptRental = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (rentalId: string) => {
      const response = await api.patch<Rental>(`/rentals/${rentalId}/accept`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing-requests'] })
    }
  })
}

export const useRejectRental = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ rentalId, reason }: { rentalId: string; reason?: string }) => {
      const response = await api.patch<Rental>(`/rentals/${rentalId}/reject`, { reason })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing-requests'] })
    }
  })
}

export const useCancelRental = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (rentalId: string) => {
      const response = await api.patch<Rental>(`/rentals/${rentalId}/cancel`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borrowing-rentals'] })
    }
  })
}

export const useReturnRental = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (rentalId: string) => {
      const response = await api.patch<RentalReturnResponse>(`/rentals/${rentalId}/return`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing-requests'] })
      queryClient.invalidateQueries({ queryKey: ['listings'] })
    }
  })
}