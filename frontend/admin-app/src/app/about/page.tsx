export const dynamic = 'force-static';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl shadow-sm p-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Rendering modes in Admin App</h1>
          <p className="text-gray-600 leading-7 mb-6">
            This page is generated at build time and served as a static asset. It explains how the admin interface uses client-side rendering for interactivity.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-indigo-100 p-6 bg-indigo-50">
              <h2 className="text-xl font-semibold mb-3">Static / SSG</h2>
              <p className="text-gray-700 leading-7">
                Static content is ideal for help pages, documentation, and admin reference pages that do not require real-time data.
              </p>
            </div>
            <div className="rounded-2xl border border-indigo-100 p-6 bg-indigo-50">
              <h2 className="text-xl font-semibold mb-3">CSR</h2>
              <p className="text-gray-700 leading-7">
                The admin dashboard uses client-side rendering and React Query to update orders and restaurant data without full page reloads.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
