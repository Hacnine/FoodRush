'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { User, MapPin, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();

  useEffect(() => {
    if (!token) router.push('/login');
  }, [token]);

  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState('');
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: '', street: '', city: '', state: '', zipCode: '' });

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => api.get(`/users/${user?.id}`).then((r) => r.data),
    enabled: !!user?.id,
    onSuccess: (data) => {
      setEditName(data.name || '');
      setEditPhone(data.phone || '');
    },
  } as any);

  const { data: addresses } = useQuery({
    queryKey: ['addresses', user?.id],
    queryFn: () => api.get(`/users/${user?.id}/addresses`).then((r) => r.data),
    enabled: !!user?.id,
  });

  const updateProfile = useMutation({
    mutationFn: () => api.put(`/users/${user?.id}`, { name: editName, phone: editPhone }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['profile'] }); toast.success('Profile updated'); },
    onError: () => toast.error('Update failed'),
  });

  const addAddress = useMutation({
    mutationFn: () => api.post(`/users/${user?.id}/addresses`, newAddress),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addresses'] });
      setShowAddAddress(false);
      setNewAddress({ label: '', street: '', city: '', state: '', zipCode: '' });
      toast.success('Address added');
    },
    onError: () => toast.error('Failed to add address'),
  });

  const deleteAddress = useMutation({
    mutationFn: (addressId: string) => api.delete(`/users/${user?.id}/addresses/${addressId}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['addresses'] }); toast.success('Address removed'); },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

        {/* Profile Info */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-orange-500" />
            </div>
            <h2 className="font-semibold">Personal Info</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                value={user?.email || ''}
                disabled
                className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
          </div>
          <button
            onClick={() => updateProfile.mutate()}
            disabled={updateProfile.isPending}
            className="mt-4 bg-orange-500 text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-orange-600 disabled:opacity-50"
          >
            {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Addresses */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-500" />
              </div>
              <h2 className="font-semibold">Saved Addresses</h2>
            </div>
            <button
              onClick={() => setShowAddAddress(!showAddAddress)}
              className="flex items-center gap-1.5 text-sm text-orange-500 font-medium hover:text-orange-600"
            >
              <Plus className="w-4 h-4" />
              Add New
            </button>
          </div>

          {showAddAddress && (
            <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
              {(['label', 'street', 'city', 'state', 'zipCode'] as const).map((field) => (
                <input
                  key={field}
                  placeholder={field.replace(/([A-Z])/g, ' $1').trim()}
                  value={newAddress[field]}
                  onChange={(e) => setNewAddress({ ...newAddress, [field]: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              ))}
              <div className="flex gap-2">
                <button
                  onClick={() => addAddress.mutate()}
                  disabled={addAddress.isPending}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
                >
                  Save Address
                </button>
                <button
                  onClick={() => setShowAddAddress(false)}
                  className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {addresses?.length === 0 || !addresses ? (
            <p className="text-gray-400 text-sm text-center py-4">No saved addresses</p>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr: any) => (
                <div key={addr.id} className="flex justify-between items-start border rounded-xl p-3">
                  <div>
                    <p className="font-medium text-sm">{addr.label}</p>
                    <p className="text-xs text-gray-500">{addr.street}, {addr.city}, {addr.state} {addr.zipCode}</p>
                  </div>
                  <button
                    onClick={() => deleteAddress.mutate(addr.id)}
                    className="text-red-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
