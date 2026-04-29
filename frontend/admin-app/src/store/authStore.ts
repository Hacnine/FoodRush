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
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          if (data.user.role !== 'admin') {
            set({ isLoading: false });
            throw new Error('Access denied. Admin account required.');
          }
          if (typeof window !== 'undefined') {
            localStorage.setItem('admin_token', data.token);
          }
          set({ user: data.user, token: data.token, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('admin_token');
        }
        set({ user: null, token: null });
      },
    }),
    { name: 'admin-auth', partialize: (s) => ({ user: s.user, token: s.token }) }
  )
);
