'use client';
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import {
  ShoppingBag, BookOpen, BarChart3, LogOut, UtensilsCrossed,
  Plus, Trash2,
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-purple-100 text-purple-700',
  ready: 'bg-teal-100 text-teal-700',
  out_for_delivery: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const STATUS_NEXT: Record<string, string> = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
};

export default function DashboardPage() {
  const { user, token, restaurantId, logout } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();
  const [tab, setTab] = useState<'orders' | 'menu' | 'analytics'>('orders');
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '', description: '', price: '', category: 'Main Course', preparationTime: 15,
  });

  useEffect(() => {
    if (!token) router.push('/login');
  }, [token]);

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['restaurant-orders', restaurantId],
    queryFn: () => api.get(`/orders/restaurant/${restaurantId}`).then((r) => r.data),
    enabled: !!restaurantId && tab === 'orders',
    refetchInterval: 20000,
  });

  const { data: menu, isLoading: menuLoading } = useQuery({
    queryKey: ['restaurant-menu', restaurantId],
    queryFn: () => api.get(`/restaurants/${restaurantId}/menu`).then((r) => r.data),
    enabled: !!restaurantId && tab === 'menu',
  });

  const updateStatus = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      api.patch(`/orders/${orderId}/status`, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['restaurant-orders'] }); toast.success('Status updated'); },
    onError: () => toast.error('Failed to update status'),
  });

  const addMenuItem = useMutation({
    mutationFn: () =>
      api.post(`/restaurants/${restaurantId}/menu`, { ...newItem, price: parseFloat(newItem.price) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['restaurant-menu'] });
      setShowAddItem(false);
      setNewItem({ name: '', description: '', price: '', category: 'Main Course', preparationTime: 15 });
      toast.success('Menu item added');
    },
    onError: () => toast.error('Failed to add item'),
  });

  const deleteMenuItem = useMutation({
    mutationFn: (itemId: string) => api.delete(`/restaurants/${restaurantId}/menu/${itemId}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['restaurant-menu'] }); toast.success('Item removed'); },
  });

  const NAV = [
    { key: 'orders', label: 'Orders', icon: ShoppingBag },
    { key: 'menu', label: 'Menu', icon: BookOpen },
    { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  if (!token) return null;

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-sm flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2 font-bold text-xl text-orange-500">
            <UtensilsCrossed className="w-6 h-6" />
            Restaurant
          </div>
          <p className="text-xs text-gray-500 mt-1 truncate">{user?.name}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key as any)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                tab === key ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={() => { logout(); router.push('/login'); }}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 w-full px-4 py-2"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-8">
        {tab === 'orders' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
              <span className="text-sm text-gray-400">Auto-refreshes every 20s</span>
            </div>
            {ordersLoading ? (
              <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-2xl h-32 animate-pulse" />)}</div>
            ) : !orders?.length ? (
              <div className="text-center py-20 text-gray-400 bg-white rounded-2xl">
                <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No orders yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order: any) => (
                  <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold">Order #{order.id?.slice(0, 8)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleString()}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                        {order.status?.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="space-y-1 mb-3">
                      {order.items?.map((item: any) => (
                        <p key={item.id} className="text-sm text-gray-600">{item.name} <span className="text-gray-400">×{item.quantity}</span></p>
                      ))}
                    </div>
                    {order.notes && (
                      <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mb-3">Note: {order.notes}</p>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-orange-500">${order.total}</span>
                      <div className="flex gap-2">
                        {STATUS_NEXT[order.status] && (
                          <button
                            onClick={() => updateStatus.mutate({ orderId: order.id, status: STATUS_NEXT[order.status] })}
                            disabled={updateStatus.isPending}
                            className="px-4 py-1.5 bg-orange-500 text-white text-xs rounded-lg hover:bg-orange-600 font-medium disabled:opacity-50"
                          >
                            Mark {STATUS_NEXT[order.status].replace(/_/g, ' ')}
                          </button>
                        )}
                        {order.status === 'pending' && (
                          <button
                            onClick={() => updateStatus.mutate({ orderId: order.id, status: 'cancelled' })}
                            className="px-4 py-1.5 bg-red-100 text-red-600 text-xs rounded-lg hover:bg-red-200 font-medium"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'menu' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Menu</h1>
              <button
                onClick={() => setShowAddItem(!showAddItem)}
                className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-orange-600"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>
            {showAddItem && (
              <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                <h3 className="font-semibold mb-4">New Menu Item</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="Name" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
                  <input type="number" placeholder="Price" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
                  <input placeholder="Category" value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
                  <input type="number" placeholder="Prep time (min)" value={newItem.preparationTime} onChange={(e) => setNewItem({ ...newItem, preparationTime: parseInt(e.target.value) })} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
                  <textarea placeholder="Description" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} className="col-span-2 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none" rows={2} />
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => addMenuItem.mutate()} disabled={addMenuItem.isPending || !newItem.name || !newItem.price} className="bg-orange-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50">
                    {addMenuItem.isPending ? 'Adding...' : 'Add Item'}
                  </button>
                  <button onClick={() => setShowAddItem(false)} className="px-5 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
                </div>
              </div>
            )}
            {menuLoading ? (
              <div className="grid grid-cols-3 gap-4">{[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="bg-white rounded-xl h-32 animate-pulse" />)}</div>
            ) : menu && Object.keys(menu).length > 0 ? (
              Object.entries(menu).map(([category, items]: [string, any]) => (
                <div key={category} className="mb-8">
                  <h2 className="text-base font-semibold text-gray-600 uppercase tracking-wide mb-3">{category}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item: any) => (
                      <div key={item._id} className="bg-white rounded-xl p-4 shadow-sm flex flex-col">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-sm">{item.name}</h4>
                          <button onClick={() => deleteMenuItem.mutate(item._id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 flex-1 line-clamp-2">{item.description}</p>
                        <div className="flex justify-between items-center mt-3">
                          <span className="font-bold text-orange-500">${item.price?.toFixed(2)}</span>
                          <span className="text-xs text-gray-400">{item.preparationTime} min</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl text-gray-400">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No menu items yet.</p>
              </div>
            )}
          </div>
        )}

        {tab === 'analytics' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Orders', value: orders?.length ?? 0, color: 'text-blue-600' },
                { label: 'Revenue', value: `$${(orders?.reduce((s: number, o: any) => s + parseFloat(o.total || 0), 0) ?? 0).toFixed(2)}`, color: 'text-green-600' },
                { label: 'Active', value: orders?.filter((o: any) => !['delivered', 'cancelled'].includes(o.status))?.length ?? 0, color: 'text-orange-600' },
                { label: 'Completed', value: orders?.filter((o: any) => o.status === 'delivered')?.length ?? 0, color: 'text-purple-600' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm">
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
