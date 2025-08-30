// Update to use new components
import { Suspense } from 'react';
import { 
  CardsSkeleton,
  BarChartSectionSkeleton,
  LineGraphSectionSkeleton,
  CityComparisonChartSkeleton,
  StatsSectionSkeleton
} from '@/app/ui/skeletons';
import SummaryCards from '@/app/ui/dashboard/summary-cards';
import PriceChart from '@/app/ui/dashboard/price-chart';
import LatestProperties from '@/app/ui/dashboard/latest-properties';
import BarChartSection from '@/app/ui/components/price/BarChartSection';
import LineGraphSection from '@/app/ui/components/price/LineGraphSection';
import CityComparisonChart from '@/app/ui/components/price/CityComparisonChart';
import StatsSection from '@/app/ui/components/price/StatsSection';

export default async function Page() {
  return (
    <main className="flex min-h-screen flex-col p-6">
      <h1 className={`mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      
      {/* Summary Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<CardsSkeleton />}>
          <SummaryCards />
        </Suspense>
      </div>
      
      {/* House Price Analysis Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">House Prices Analysis</h2>
        
        <div className="grid gap-6">
          {/* Bar Chart - House Prices by Suburb */}
          <section className="rounded-lg bg-gray-50 p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">House Prices by Suburb (Filtered by State)</h3>
            <Suspense fallback={<BarChartSectionSkeleton />}>
              <BarChartSection />
            </Suspense>
          </section>
          
          {/* Line Graph - Price Trends */}
          <section className="rounded-lg bg-gray-50 p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">House Price Trend for a Suburb</h3>
            <Suspense fallback={<LineGraphSectionSkeleton />}>
              <LineGraphSection />
            </Suspense>
          </section>
          
          {/* City Comparison Chart */}
          <section className="rounded-lg bg-gray-50 p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Average House Prices Across States</h3>
            <Suspense fallback={<CityComparisonChartSkeleton />}>
              <CityComparisonChart />
            </Suspense>
          </section>
          
          {/* Stats Section */}
          <section className="rounded-lg bg-gray-50 p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Min/Max/Avg House Prices</h3>
            <Suspense fallback={<StatsSectionSkeleton />}>
              <StatsSection />
            </Suspense>
          </section>
        </div>
      </div>
    </main>
  );
}