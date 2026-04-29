'use client';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import MenuItemCard from '@/components/MenuItemCard';
import { Star, Clock, Truck, MapPin } from 'lucide-react';
import api from '@/lib/api';

export default function RestaurantPage() {
  const { id } = useParams();

  const { data: restaurant, isLoading: loadingRestaurant } = useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => api.get(`/restaurants/${id}`).then((r) => r.data),
  });

  const { data: menu, isLoading: loadingMenu } = useQuery({
    queryKey: ['menu', id],
    queryFn: () => api.get(`/restaurants/${id}/menu`).then((r) => r.data),
    enabled: !!id,
  });

  if (loadingRestaurant) return <div className="min-h-screen"><Navbar /><div className="p-8 text-center">Loading...</div></div>;
  if (!restaurant) return <div>Restaurant not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Cover */}
      <div className="h-56 bg-gray-200 relative">
        {restaurant.imageUrl && (
          <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-6 left-6 text-white">
          <h1 className="text-4xl font-bold">{restaurant.name}</h1>
          <p className="text-white/80 mt-1">{restaurant.description}</p>
        </div>
      </div>

      {/* Info Bar */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-wrap gap-6 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            {restaurant.rating?.toFixed(1)} ({restaurant.totalReviews} reviews)
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {restaurant.estimatedDeliveryTime} min
          </span>
          <span className="flex items-center gap-1">
            <Truck className="w-4 h-4" />
            {restaurant.deliveryFee === 0 ? 'Free delivery' : `$${restaurant.deliveryFee} delivery`}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {restaurant.city}
          </span>
          <span className={`font-medium ${restaurant.isOpen ? 'text-green-600' : 'text-red-500'}`}>
            {restaurant.isOpen ? '● Open' : '● Closed'}
          </span>
        </div>
      </div>

      {/* Menu */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {loadingMenu ? (
          <p>Loading menu...</p>
        ) : menu && Object.keys(menu).length > 0 ? (
          Object.entries(menu).map(([category, items]: [string, any]) => (
            <div key={category} className="mb-10">
              <h2 className="text-xl font-bold text-gray-900 mb-4 capitalize">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item: any) => (
                  <MenuItemCard key={item._id} item={{ ...item, restaurantId: id as string }} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No menu items available yet.</p>
        )}
      </div>
    </div>
  );
}
