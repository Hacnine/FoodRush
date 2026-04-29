'use client';
import Link from 'next/link';
import { ShoppingCart, User, LogOut, UtensilsCrossed } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const totalItems = useCartStore((s) => s.totalItems());

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-orange-500">
            <UtensilsCrossed className="w-6 h-6" />
            FoodRush
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/restaurants" className="text-gray-600 hover:text-orange-500 text-sm font-medium">
              Restaurants
            </Link>

            <Link href="/cart" className="relative p-2 text-gray-600 hover:text-orange-500">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <Link href="/profile" className="flex items-center gap-1 text-sm text-gray-700">
                  <User className="w-4 h-4" />
                  {user.name.split(' ')[0]}
                </Link>
                <button onClick={logout} className="p-1 text-gray-400 hover:text-red-500">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="text-sm text-gray-600 hover:text-orange-500">Login</Link>
                <Link href="/register" className="bg-orange-500 text-white text-sm px-4 py-1.5 rounded-full hover:bg-orange-600">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
