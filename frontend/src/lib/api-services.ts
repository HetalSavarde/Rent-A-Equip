/**
 * API Service Layer
 * 
 * This file contains all API service functions.
 * Currently returns mock data. To connect to your real backend:
 * 
 * 1. Set VITE_API_BASE_URL in .env to your backend URL (e.g. http://localhost:8000/api)
 * 2. Uncomment the `api.get(...)` / `api.post(...)` lines
 * 3. Remove the mock data returns
 * 
 * All functions use the Axios instance from ./api.ts which handles:
 * - Base URL configuration
 * - Auth token injection via interceptor
 * - 401 redirect to /login
 */

import api from './api';

export const categoryIcons = {
  Cricket: '🏏',
  Football: '⚽',
  Tennis: '🎾',
  // Add your other categories here
};  

// ─── AUTH ───────────────────────────────────────────────

export const authService = {
  async login(email: string, password: string) {
    return api.post('/auth/login', { email, password });
    
  },

  async register(name: string, email: string, password: string, phone?: string) {
    return api.post('/auth/register', { name, email, password, phone });
    return { message: 'Registration successful' };
  },

  async getProfile() {
    return api.get('/auth/profile');
  },

  async updateProfile(data: { name?: string; phone?: string }) {
    return api.put('/auth/profile', data);
  },
};

// ─── LISTINGS ───────────────────────────────────────────

export const listingService = {
  async getAll(params?: { category?: string; search?: string; available?: boolean }) {
    return api.get('/listings', { params });
  },

  async getById(id: string) {
     return api.get(`/listings/${id}`);
  },

  async create(data: {
    name: string;
    category: string;
    description: string;
    available_qty: number;
    daily_rate: number;
    location: string;
    phone: string;
    image_url?: string;
  }) {
    return api.post('/listings', data);
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
    return api.put(`/listings/${id}`, data);
  },

  async delete(id: string) {
    return api.delete(`/listings/${id}`);
    return { message: 'Listing deleted', id };
  },

  async pause(id: string) {
    return api.patch(`/listings/${id}/pause`);
    return { id, status: 'paused' };
  },

  async resume(id: string) {
    return api.patch(`/listings/${id}/resume`);
    return { id, status: 'active' };
  },
};

// ─── RENTALS (Borrower) ─────────────────────────────────

export const rentalService = {
  async getMyRentals(status?: string) {
    return api.get('/rentals/mine', { params: { status } });
  },

  async createBooking(data: {
    listing_id: string;
    quantity: number;
    start_date: string;
    due_date: string;
  }) {
    return api.post('/rentals', data);
    return { id: 'rent-' + Date.now(), ...data, status: 'pending' };
  },

  async cancelBooking(rentalId: string) {
    return api.patch(`/rentals/${rentalId}/cancel`);
    return { id: rentalId, status: 'cancelled' };
  },
};

// ─── RENTAL REQUESTS (Lister) ───────────────────────────

export const listerRequestService = {
  async getMyListings() {
    return api.get('/listings/mine');
  },

  async getIncomingRequests() {
    return api.get('/rentals/requests');
  },

  async acceptRequest(requestId: string) {
    return api.patch(`/rentals/requests/${requestId}/accept`);
    return { id: requestId, status: 'active' };
  },

  async rejectRequest(requestId: string) {
    return api.patch(`/rentals/requests/${requestId}/reject`);
    return { id: requestId, status: 'cancelled' };
  },

  async markReturned(requestId: string) {
    return api.patch(`/rentals/requests/${requestId}/return`);
    return { id: requestId, status: 'returned' };
  },

  async markFinePaid(requestId: string) {
    return api.patch(`/rentals/requests/${requestId}/fine-paid`);
    return { id: requestId, fine_paid: true };
  },

  async reportDamage(requestId: string, description: string) {
    return api.post(`/rentals/requests/${requestId}/damage`, { description });
    return { message: 'Damage report submitted' };
  },
};

// ─── FINES ──────────────────────────────────────────────

export const fineService = {
  async getMyFines() {
    return api.get('/fines/mine');
  },
};

// ─── REVIEWS ────────────────────────────────────────────

export const reviewService = {
  async getByListing(listingId: string) {
    return api.get(`/listings/${listingId}/reviews`);
  },

  async getMyReviews() {
     return api.get('/reviews/mine');
  },

  async create(data: { listing_id: string; rating: number; comment: string }) {
     return api.post('/reviews', data);
    return { id: 'rev-' + Date.now(), ...data };
  },
};
