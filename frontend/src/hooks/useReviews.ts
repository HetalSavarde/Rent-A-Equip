import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import type { ReviewListResponse } from '../types/api'

export const useListingReviews = (listingId: string) => {
  return useQuery({
    queryKey: ['listing-reviews', listingId],
    queryFn: async () => {
      const response = await api.get<ReviewListResponse>(`/reviews/listing/${listingId}`)
      return response.data
    },
    enabled: !!listingId
  })
}

export const useUserReviews = (userId: string) => {
  return useQuery({
    queryKey: ['user-reviews', userId],
    queryFn: async () => {
      const response = await api.get<ReviewListResponse>(`/reviews/user/${userId}`)
      return response.data
    },
    enabled: !!userId
  })
}

export const usePostReview = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      rental_id: string
      target_type: 'listing' | 'user'
      rating: number
      comment?: string
    }) => {
      const response = await api.post('/reviews', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing-reviews'] })
      queryClient.invalidateQueries({ queryKey: ['user-reviews'] })
    }
  })
}