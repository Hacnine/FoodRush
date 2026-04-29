'use client';
import { useRouter } from 'next/navigation';
import { Trash2, ShoppingBag } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useCartStore } from '@/store/cartStore';

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700">Your cart is empty</h2>
          <p className="text-gray-500 mt-2">Add some items from a restaurant to get started!</p>
          <button onClick={() => router.push('/')} className="mt-6 bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600">
            Browse Restaurants
          </button>
        </div>
      </div>
    );
  }

  const deliveryFee = 2.99;
  const total = subtotal() + deliveryFee;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Cart</h1>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
          {items.map((item) => (
            <div key={item.itemId} className="flex items-center gap-4 p-4 border-b last:border-b-0">
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
              )}
              <div className="flex-1">
                <h4 className="font-semibold">{item.name}</h4>
                <p className="text-orange-500 font-bold">${item.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(item.itemId, item.quantity - 1)} className="w-7 h-7 rounded-full border flex items-center justify-center hover:bg-gray-100">−</button>
                <span className="w-6 text-center font-semibold">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.itemId, item.quantity + 1)} className="w-7 h-7 rounded-full border flex items-center justify-center hover:bg-gray-100">+</button>
              </div>
              <button onClick={() => removeItem(item.itemId)} className="text-gray-400 hover:text-red-500 ml-2">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between"><span>Subtotal</span><span>${subtotal().toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Delivery fee</span><span>${deliveryFee.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t">
              <span>Total</span><span>${total.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={() => router.push('/checkout')}
            className="w-full mt-6 bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
