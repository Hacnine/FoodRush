import Navbar from '@/components/Navbar';
import RestaurantsList from '@/components/RestaurantsList';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
export const revalidate = 3600;

async function fetchWithTimeout(url: string, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export default async function RestaurantsPage() {
  let restaurants = [];

  try {
    const response = await fetchWithTimeout(`${API_URL}/restaurants?limit=24`, {
      next: { revalidate },
    });

    if (response?.ok) {
      const payload = await response.json();
      restaurants = payload?.data || [];
    }
  } catch (error) {
    console.warn('Restaurants list fetch failed during build or render:', error);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="rounded-3xl bg-gradient-to-r from-orange-500 to-pink-500 text-white p-10 shadow-lg mb-10">
          <h1 className="text-4xl font-bold mb-4">Restaurants list — built with ISR</h1>
          <p className="max-w-3xl text-orange-100 text-lg">
            This page is generated at build time and refreshed every hour using Next.js Incremental Static Regeneration.
            Search and filter on the client without losing the performance benefits of static rendering.
          </p>
        </div>

        <RestaurantsList initialRestaurants={restaurants} />
      </div>
    </div>
  );
}
