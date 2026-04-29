'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  restaurantId: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setRestaurantId: (id: string) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      restaurantId: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          if (data.user.role !== 'restaurant_owner') {
            set({ isLoading: false });
            throw new Error('Access denied. Restaurant owner account required.');
          }
          if (typeof window !== 'undefined') {
            localStorage.setItem('restaurant_token', data.token);
          }
          set({ user: data.user, token: data.token, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('restaurant_token');
          localStorage.removeItem('restaurant_id');
        }
        set({ user: null, token: null, restaurantId: null });
      },

      setRestaurantId: (id) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('restaurant_id', id);
        }
        set({ restaurantId: id });
      },
    }),
    { name: 'restaurant-auth', partialize: (s) => ({ user: s.user, token: s.token, restaurantId: s.restaurantId }) }
  )
);
