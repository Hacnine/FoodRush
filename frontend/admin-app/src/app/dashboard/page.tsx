'use client';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Shield, Users, UtensilsCrossed, BarChart3, LogOut } from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, token, logout } = useAuthStore();
  const router = useRouter();
  const [tab, setTab] = useState<'overview' | 'users' | 'restaurants'>('overview');

  useEffect(() => {
    if (!token) router.push('/login');
  }, [token]);

  const { data: restaurants } = useQuery({
    queryKey: ['restaurants'],
    queryFn: () => api.get('/restaurants?limit=100').then((r) => r.data.items || r.data),
    enabled: tab === 'restaurants' || tab === 'overview',
  });

  const { data: allOrders } = useQuery({
    queryKey: ['all-orders'],
    queryFn: () => api.get('/orders').then((r) => r.data).catch(() => []),
    enabled: tab === 'overview',
  });

  const NAV = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'restaurants', label: 'Restaurants', icon: UtensilsCrossed },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-sm flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2 font-bold text-xl text-indigo-600">
            <Shield className="w-6 h-6" />
            Admin Panel
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key as any)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                tab === key ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
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
        {tab === 'overview' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Platform Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Total Restaurants', value: restaurants?.length ?? 0, color: 'text-orange-500' },
                { label: 'Total Orders', value: allOrders?.length ?? 0, color: 'text-blue-600' },
                { label: 'Active Restaurants', value: restaurants?.filter((r: any) => r.isActive)?.length ?? 0, color: 'text-green-600' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm">
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'restaurants' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Restaurants</h1>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    {['Name', 'City', 'Status', 'Rating', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {restaurants?.map((r: any) => (
                    <tr key={r._id || r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-sm">{r.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{r.city}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${r.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {r.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{r.rating?.toFixed(1) ?? 'N/A'}</td>
                      <td className="px-4 py-3">
                        <button className="text-xs text-indigo-600 hover:underline">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">User Management</h1>
            <div className="bg-white rounded-2xl p-8 shadow-sm text-center text-gray-400">
              User management requires a dedicated admin API endpoint.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
