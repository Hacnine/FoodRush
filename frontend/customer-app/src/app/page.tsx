import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 py-28">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.6),transparent_40%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] items-center">
            <div className="text-white">
              <p className="text-sm uppercase tracking-[0.3em] text-orange-100 mb-4">FoodRush</p>
              <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">Fast food delivery, right where you are.</h1>
              <p className="mt-6 max-w-2xl text-lg text-orange-100">
                Enjoy local restaurants, live menus, and seamless checkout with client-side interactivity.
                The home page is served statically for instant load, while restaurant and order content use server rendering and ISR.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link href="/restaurants" className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3 text-base font-semibold text-orange-600 shadow-lg shadow-orange-200 transition hover:bg-orange-50">
                  Browse Restaurants
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
                <Link href="/about" className="inline-flex items-center justify-center rounded-full border border-white/70 bg-white/10 px-7 py-3 text-base font-semibold text-white transition hover:bg-white/20">
                  About rendering modes
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] bg-white/10 p-10 ring-1 ring-white/20 backdrop-blur-xl">
              <div className="space-y-6 text-white">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-orange-100">Static welcome</p>
                  <h2 className="text-3xl font-bold">SSG / static</h2>
                  <p className="mt-3 text-sm text-orange-100/90">
                    This page is generated at build time and served as a fast, cached HTML entry point.
                  </p>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-orange-100">Server-rendered details</p>
                  <h2 className="text-3xl font-bold">SSR</h2>
                  <p className="mt-3 text-sm text-orange-100/90">
                    Restaurant detail pages always fetch fresh menu data on the server.
                  </p>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-orange-100">Incremental updates</p>
                  <h2 className="text-3xl font-bold">ISR</h2>
                  <p className="mt-3 text-sm text-orange-100/90">
                    The restaurants list is regenerated every hour for updated content without rebuilding the entire site.
                  </p>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-orange-100">Client interactivity</p>
                  <h2 className="text-3xl font-bold">CSR</h2>
                  <p className="mt-3 text-sm text-orange-100/90">
                    Cart, checkout, and login pages remain interactive in the browser using client-side state.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
