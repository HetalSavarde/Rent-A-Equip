export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: 'user' | 'admin'
  created_at: string
}

export interface UserPublicProfile {
  id: string
  name: string
  avg_rating?: number
  total_reviews: number
  listings_count: number
}

export interface TokenResponse {
  access_token: string
  token_type: string
  role: string
}

export interface Listing {
  id: string
  name: string
  category: string
  description?: string
  available_qty: number
  daily_rate: number
  location: string
  image_url?: string
  status: string
  is_paused: boolean
  lister?: UserPublicProfile
  avg_rating?: number
  total_reviews: number
  created_at: string
}

export interface ListingListResponse {
  items: Listing[]
  total: number
  page: number
  limit: number
}

export interface Rental {
  id: string
  listing_id: string
  listing_name?: string
  borrower_id: string
  borrower_name?: string
  lister_id: string
  lister_name?: string
  quantity: number
  start_date: string
  due_date: string
  returned_date?: string
  status: 'pending' | 'active' | 'returned' | 'overdue' | 'cancelled'
  rejection_reason?: string
  created_at: string
}

export interface RentalReturnResponse {
  id: string
  status: string
  returned_date: string
  fine_created: boolean
  fine_amount?: number
}

export interface Fine {
  id: string
  rental_id: string
  listing_name?: string
  amount: number
  days_overdue: number
  status: 'unpaid' | 'paid'
  created_at: string
}

export interface Review {
  id: string
  rental_id: string
  reviewer_id: string
  reviewer_name?: string
  rating: number
  comment?: string
  target_type: 'listing' | 'user'
  created_at: string
}

export interface ReviewListResponse {
  reviews: Review[]
  avg_rating?: number
  total_reviews: number
}

export interface DamageReport {
  id: string
  rental_id: string
  description: string
  status: 'pending' | 'resolved'
  created_at: string
}

export interface ApiError {
  detail: string
}