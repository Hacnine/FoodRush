export const dynamic = 'force-static';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl shadow-sm p-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Rendering modes in Restaurant App</h1>
          <p className="text-gray-600 leading-7 mb-6">
            This page is generated at build time and served as a static asset. It demonstrates an SSG-style route in the restaurant dashboard app.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-orange-100 p-6 bg-orange-50">
              <h2 className="text-xl font-semibold mb-3">Static / SSG</h2>
              <p className="text-gray-700 leading-7">
                This about page is statically generated and delivered directly from the server or CDN. Static pages are ideal for documentation, marketing, and stable content.
              </p>
            </div>
            <div className="rounded-2xl border border-orange-100 p-6 bg-orange-50">
              <h2 className="text-xl font-semibold mb-3">CSR</h2>
              <p className="text-gray-700 leading-7">
                The restaurant dashboard itself is client-side rendered, using React state and React Query to keep the UI responsive and interactive.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
