'use client';
import { Plus, Minus } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';

interface Props {
  item: {
    _id: string;
    restaurantId: string;
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
    category: string;
    isAvailable: boolean;
  };
}

export default function MenuItemCard({ item }: Props) {
  const { addItem, items, updateQuantity } = useCartStore();
  const cartItem = items.find((i) => i.itemId === item._id);

  const handleAdd = () => {
    addItem({
      itemId: item._id,
      restaurantId: item.restaurantId,
      name: item.name,
      price: item.price,
      quantity: 1,
      imageUrl: item.imageUrl,
    });
    toast.success(`${item.name} added to cart`);
  };

  return (
    <div className={`flex gap-4 p-4 bg-white rounded-xl border ${!item.isAvailable ? 'opacity-50' : ''}`}>
      {item.imageUrl && (
        <img src={item.imageUrl} alt={item.name} className="w-24 h-24 object-cover rounded-lg flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900">{item.name}</h4>
        <p className="text-gray-500 text-sm mt-0.5 line-clamp-2">{item.description}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="font-bold text-orange-500">${item.price.toFixed(2)}</span>
          {item.isAvailable ? (
            cartItem ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item._id, cartItem.quantity - 1)}
                  className="p-1 rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-semibold w-6 text-center">{cartItem.quantity}</span>
                <button
                  onClick={() => updateQuantity(item._id, cartItem.quantity + 1)}
                  className="p-1 rounded-full bg-orange-500 text-white hover:bg-orange-600"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAdd}
                className="flex items-center gap-1 bg-orange-500 text-white px-3 py-1.5 rounded-full text-sm hover:bg-orange-600"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            )
          ) : (
            <span className="text-sm text-gray-400">Unavailable</span>
          )}
        </div>
      </div>
    </div>
  );
}
