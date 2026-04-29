'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import Navbar from '@/components/Navbar';
import RestaurantCard from '@/components/RestaurantCard';
import api from '@/lib/api';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['restaurants', search, city],
    queryFn: () => api.get('/restaurants', { params: { search, city, limit: 24 } }).then((r) => r.data),
  });

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Order food you love</h1>
          <p className="text-orange-100 text-xl mb-10">Fast delivery from the best restaurants near you</p>

          <div className="flex gap-3 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search restaurants or cuisines..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
            <input
              type="text"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-36 px-4 py-3 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
        </div>
      </div>

      {/* Restaurants Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {search || city ? 'Search Results' : 'Featured Restaurants'}
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data?.data?.map((r: any) => <RestaurantCard key={r._id} restaurant={r} />)}
          </div>
        )}

        {data?.data?.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <p className="text-xl">No restaurants found</p>
            <p className="text-sm mt-2">Try a different search or city</p>
          </div>
        )}
      </div>
    </div>
  );
}
