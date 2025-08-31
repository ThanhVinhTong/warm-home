import Link from 'next/link';
import { inter } from '@/app/ui/fonts';

export default function HomePage() {
  return (
    <main className={`flex min-h-screen flex-col ${inter.className} bg-gray-50`}>
      {/* Hero Section */}
      <div className="flex h-96 shrink-0 items-center justify-center bg-white border-b border-gray-200 p-4 md:h-[20rem]">
        <div className="w-full text-center">
          <h1 className="text-4xl font-bold text-gray-900 md:text-6xl mb-4">
            Warm Home
          </h1>
          <p className="text-xl text-gray-600 md:text-2xl mb-8">
            <b>Professional</b> yet <b>simple-to-use</b> Australian Real Estate Analytics
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-16 px-6">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Professional Market Analysis Tools
        </h2>
        
        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          <div className="text-center p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Market Analysis</h3>
            <p className="text-gray-600">
              Comprehensive analysis of house prices across suburbs and states with interactive charts and trends.
            </p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 616 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Property Search</h3>
            <p className="text-gray-600">
              Find and analyze properties with advanced search tools and detailed market information.
            </p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Price Analytics</h3>
            <p className="text-gray-600">
              Detailed insights into property values, market trends, and investment opportunities.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-16 bg-white border-t border-gray-200 py-16 px-6">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Analyze the Market?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Access comprehensive market data and powerful analytics tools for informed decision making.
          </p>
          <Link 
            href="/dashboard" 
            className="inline-block bg-slate-800 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-slate-900 transition-colors shadow-sm"
          >
            Launch Analytics Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}