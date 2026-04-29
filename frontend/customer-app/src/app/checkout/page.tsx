'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const deliveryFee = 2.99;
  const total = subtotal() + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!user) { router.push('/login'); return; }
    if (!address.street || !address.city || !address.state || !address.zipCode) {
      toast.error('Please fill in the delivery address');
      return;
    }

    setLoading(true);
    try {
      const { data: order } = await api.post('/orders', {
        restaurantId: items[0]?.restaurantId,
        items: items.map((i) => ({
          menuItemId: i.itemId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          imageUrl: i.imageUrl,
        })),
        deliveryAddress: address,
        deliveryFee,
      });

      const { data: payment } = await api.post('/payment/create', {
        orderId: order.id,
        amount: total,
      });

      clearCart();
      toast.success('Order placed successfully!');
      router.push(`/orders/${order.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Delivery Address</h2>
              <div className="space-y-3">
                {(['street', 'city', 'state', 'zipCode'] as const).map((field) => (
                  <input
                    key={field}
                    type="text"
                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                    value={address[field]}
                    onChange={(e) => setAddress({ ...address, [field]: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm text-gray-600">
                {items.map((item) => (
                  <div key={item.itemId} className="flex justify-between">
                    <span>{item.name} × {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 flex justify-between">
                  <span>Delivery fee</span><span>${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-base">
                  <span>Total</span><span>${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full mt-6 bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-50"
              >
                {loading ? 'Placing Order...' : `Place Order — $${total.toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
