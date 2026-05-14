'use client';
import { useMemo, useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import RestaurantCard from './RestaurantCard';

interface Restaurant {
  _id: string;
  name: string;
  description: string;
  imageUrl?: string;
  rating: number;
  estimatedDeliveryTime: number;
  deliveryFee: number;
  categories: string[];
  isOpen: boolean;
  city?: string;
}

export default function RestaurantsList({ initialRestaurants }: { initialRestaurants: Restaurant[] }) {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');

  const filteredRestaurants = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const normalizedCity = city.trim().toLowerCase();

    return initialRestaurants.filter((restaurant) => {
      const matchesSearch =
        !normalizedSearch ||
        restaurant.name.toLowerCase().includes(normalizedSearch) ||
        restaurant.description.toLowerCase().includes(normalizedSearch) ||
        restaurant.categories.some((category) => category.toLowerCase().includes(normalizedSearch));

      const matchesCity = !normalizedCity || restaurant.city?.toLowerCase().includes(normalizedCity);

      return matchesSearch && matchesCity;
    });
  }, [initialRestaurants, search, city]);

  return (
    <div>
      <div className="bg-white rounded-3xl shadow-sm p-6 mb-10">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] items-center">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Search restaurants</span>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, cuisine, or food"
                  className="w-full rounded-2xl border border-gray-200 pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">City</span>
              <div className="relative mt-2">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Filter by city"
                  className="w-full rounded-2xl border border-gray-200 pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
            </label>
          </div>
          <div className="text-sm text-gray-600">
            {filteredRestaurants.length} restaurant{filteredRestaurants.length === 1 ? '' : 's'} available
          </div>
        </div>
      </div>

      {filteredRestaurants.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-xl">No restaurants match your filters.</p>
          <p className="mt-2">Try a broader search or remove the city filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRestaurants.map((restaurant) => (
            <RestaurantCard key={restaurant._id} restaurant={restaurant} />
          ))}
        </div>
      )}
    </div>
  );
}
