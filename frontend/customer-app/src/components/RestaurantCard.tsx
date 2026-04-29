import Link from 'next/link';
import { Clock, Star, Truck } from 'lucide-react';

interface Props {
  restaurant: {
    _id: string;
    name: string;
    description: string;
    imageUrl?: string;
    rating: number;
    estimatedDeliveryTime: number;
    deliveryFee: number;
    categories: string[];
    isOpen: boolean;
  };
}

export default function RestaurantCard({ restaurant }: Props) {
  return (
    <Link href={`/restaurants/${restaurant._id}`}>
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        <div className="relative h-48 bg-gray-200">
          {restaurant.imageUrl ? (
            <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">🍽️</div>
          )}
          {!restaurant.isOpen && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">Closed</span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-900">{restaurant.name}</h3>
          <p className="text-gray-500 text-sm mt-1 line-clamp-2">{restaurant.description}</p>

          <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              {restaurant.rating.toFixed(1)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {restaurant.estimatedDeliveryTime} min
            </span>
            <span className="flex items-center gap-1">
              <Truck className="w-4 h-4" />
              {restaurant.deliveryFee === 0 ? 'Free' : `$${restaurant.deliveryFee.toFixed(2)}`}
            </span>
          </div>

          <div className="flex flex-wrap gap-1 mt-3">
            {restaurant.categories.slice(0, 3).map((cat) => (
              <span key={cat} className="bg-orange-50 text-orange-600 text-xs px-2 py-0.5 rounded-full">
                {cat}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
