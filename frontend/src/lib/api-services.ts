import api from './api';

export const categoryIcons: Record<string, string> = {
  cricket: '🏏',
  football: '⚽',
  badminton: '🏸',
  tennis: '🎾',
  skating: '🛹',
  cycling: '🚴',
  yoga: '🧘',
  boxing: '🥊',
  swimming: '🏊',
  basketball: '🏀',
};

export const categories = [
  'cricket', 'football', 'badminton', 'tennis', 'skating',
  'cycling', 'yoga', 'boxing', 'swimming', 'basketball',
];

// ─── AUTH ───────────────────────────────────────────────

export const authService = {
  async login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async register(name: string, email: string, password: string, phone?: string) {
    const response = await api.post('/auth/register', { name, email, password, phone });
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/users/me');
    return response.data;
  },

  async updateProfile(data: { name?: string; phone?: string }) {
    const response = await api.put('/users/me', data);
    return response.data;
  },

  async logout() {
    await api.post('/auth/logout');
  },
};

// ─── LISTINGS ───────────────────────────────────────────

export const listingService = {
  async getAll(params?: {
    category?: string;
    search?: string;
    available?: boolean;
    location?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await api.get('/listings', { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/listings/${id}`);
    return response.data;
  },

  async getMy() {
    const response = await api.get('/listings/my');
    return response.data;
  },

  async create(data: {
    name: string;
    category: string;
    description?: string;
    available_qty: number;
    daily_rate: number;
    location: string;
    phone: string; 
    image_url?: string;
  }) {
    const response = await api.post('/listings', data);
    return response.data;
  },

  async update(id: string, data: {
    name?: string;
    category?: string;
    description?: string;
    available_qty?: number;
    daily_rate?: number;
    location?: string;
    phone?: string;
    image_url?: string;
  }) {
    const response = await api.put(`/listings/${id}`, data);
    return response.data;
  },

  async pause(id: string, paused: boolean) {
    const response = await api.patch(`/listings/${id}/pause`, { paused });
    return response.data;
  },

  async delete(id: string) {
    await api.delete(`/listings/${id}`);
  },
};

// ─── RENTALS (Borrower) ─────────────────────────────────

export const rentalService = {
  async getMyBorrowingRentals(status?: string) {
    const response = await api.get('/rentals/my/borrowing', {
      params: status ? { status } : {}
    });
    return response.data;
  },

  async createBooking(data: {
    listing_id: string;
    quantity: number;
    start_date: string;
    due_date: string;
  }) {
    const response = await api.post('/rentals', data);
    return response.data;
  },

  async cancelBooking(rentalId: string) {
    const response = await api.patch(`/rentals/${rentalId}/cancel`);
    return response.data;
  },
};

// ─── RENTAL REQUESTS (Lister) ───────────────────────────

export const listerRequestService = {
  async getMyListingRequests(status?: string) {
    const response = await api.get('/rentals/my/listing-requests', {
      params: status ? { status } : {}
    });
    return response.data;
  },

  async acceptRequest(rentalId: string) {
    const response = await api.patch(`/rentals/${rentalId}/accept`);
    return response.data;
  },

  async rejectRequest(rentalId: string, reason?: string) {
    const response = await api.patch(`/rentals/${rentalId}/reject`, { reason });
    return response.data;
  },

  async markReturned(rentalId: string) {
    const response = await api.patch(`/rentals/${rentalId}/return`);
    return response.data;
  },

  async reportDamage(rentalId: string, description: string) {
    const response = await api.post('/damage', {
      rental_id: rentalId,
      description,
    });
    return response.data;
  },
};

// ─── FINES ──────────────────────────────────────────────

export const fineService = {
  async getMyFinesAsBorrower() {
    const response = await api.get('/fines/my');
    return response.data;
  },

  async getMyListingFines() {
    const response = await api.get('/fines/my/listing-fines');
    return response.data;
  },

  async payFine(fineId: string) {
    const response = await api.patch(`/fines/${fineId}/pay`);
    return response.data;
  },
};

// ─── REVIEWS ────────────────────────────────────────────

export const reviewService = {
  // Get all reviews for a specific listing
  async getByListing(listingId: string) {
    const response = await api.get(`/reviews/listing/${listingId}`);
    return response.data; // returns { reviews: [], avg_rating, total_reviews }
  },

  // Get all reviews for a specific user
  async getByUser(userId: string) {
    const response = await api.get(`/reviews/user/${userId}`);
    return response.data; // returns { reviews: [], avg_rating, total_reviews }
  },

  // Create a new review
  async create(data: {
    rental_id: string;
    target_type: 'listing' | 'user';
    rating: number;
    comment?: string;
  }) {
    const response = await api.post('/reviews', data);
    return response.data; // returns ReviewOut
  },
};