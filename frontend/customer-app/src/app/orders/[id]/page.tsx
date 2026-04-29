'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { CheckCircle, Clock, Package, Truck, MapPin } from 'lucide-react';

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: Package },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'preparing', label: 'Preparing', icon: Clock },
  { key: 'out_for_delivery', label: 'On the Way', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: MapPin },
];

export default function OrderTrackingPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then((r) => setOrder(r.data));

    const socket: Socket = io(
      process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3007',
      { path: '/socket.io', transports: ['websocket'] }
    );

    socket.emit('trackOrder', { orderId: id });

    socket.on('deliveryUpdate', (data) => {
      setOrder((prev: any) => prev ? { ...prev, status: data.status } : prev);
    });

    socket.on('locationUpdate', (data) => {
      setDriverLocation({ lat: data.lat, lng: data.lng });
    });

    return () => { socket.disconnect(); };
  }, [id]);

  if (!order) return <div className="min-h-screen"><Navbar /><div className="p-8 text-center">Loading...</div></div>;

  const currentIdx = STATUS_STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Track Order</h1>
        <p className="text-gray-500 text-sm mb-8">#{order.id?.slice(0, 8)}</p>

        {/* Status Stepper */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex justify-between relative">
            <div className="absolute top-5 left-8 right-8 h-0.5 bg-gray-200" />
            <div
              className="absolute top-5 left-8 h-0.5 bg-orange-500 transition-all duration-500"
              style={{ width: `${(currentIdx / (STATUS_STEPS.length - 1)) * 100}%` }}
            />
            {STATUS_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const done = idx <= currentIdx;
              return (
                <div key={step.key} className="flex flex-col items-center relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${done ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs mt-2 text-center ${done ? 'text-orange-600 font-medium' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="font-semibold mb-4">Order Items</h2>
          {order.items?.map((item: any) => (
            <div key={item.id} className="flex justify-between py-2 border-b last:border-0 text-sm">
              <span>{item.name} × {item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold mt-3">
            <span>Total</span>
            <span>${order.total}</span>
          </div>
        </div>

        {driverLocation && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
            <p className="text-orange-700 font-medium">Driver Location Updated</p>
            <p className="text-orange-600 text-sm">Lat: {driverLocation.lat}, Lng: {driverLocation.lng}</p>
          </div>
        )}
      </div>
    </div>
  );
}
