export const dynamic = 'force-static';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl shadow-sm p-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Rendering modes implemented</h1>
          <p className="text-gray-600 leading-7 mb-6">
            This page is forced static with Next.js, so it is generated once at build time and served as a static asset.
            It demonstrates the static rendering mode, which is ideal for stable marketing content and copy-heavy pages.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-orange-100 p-6 bg-orange-50">
              <h2 className="text-xl font-semibold mb-3">Static / SSG</h2>
              <p className="text-gray-700 leading-7">
                Pages like this one are generated at build time and served instantly from the edge or CDN. Great for stable content that does not need frequent updates.
              </p>
            </div>
            <div className="rounded-2xl border border-orange-100 p-6 bg-orange-50">
              <h2 className="text-xl font-semibold mb-3">ISR</h2>
              <p className="text-gray-700 leading-7">
                The restaurants page is refreshed periodically using Incremental Static Regeneration, combining static speed with periodic freshness.
              </p>
            </div>
            <div className="rounded-2xl border border-orange-100 p-6 bg-orange-50">
              <h2 className="text-xl font-semibold mb-3">SSR</h2>
              <p className="text-gray-700 leading-7">
                Restaurant detail pages are rendered on every request with server-side data fetching, ensuring the menu and live open status are always up to date.
              </p>
            </div>
            <div className="rounded-2xl border border-orange-100 p-6 bg-orange-50">
              <h2 className="text-xl font-semibold mb-3">CSR</h2>
              <p className="text-gray-700 leading-7">
                Cart, checkout, login, and account flows are client-side, enabling interactive experience and local state management without full page reloads.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
