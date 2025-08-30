// Update to use new components
import { Suspense } from 'react';
import { CardsSkeleton, RevenueChartSkeleton, LatestInvoicesSkeleton } from '@/app/ui/skeletons'; // Adapt skeletons if needed
import SummaryCards from '@/app/ui/dashboard/summary-cards';
import PriceChart from '@/app/ui/dashboard/price-chart';
import LatestProperties from '@/app/ui/dashboard/latest-properties';

export default async function Page() {
  return (
    <main>
      <h1 className={`mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<CardsSkeleton />}>
          <SummaryCards />
        </Suspense>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <Suspense fallback={<RevenueChartSkeleton />}>
          <PriceChart />
        </Suspense>
        <Suspense fallback={<LatestInvoicesSkeleton />}>
          <LatestProperties />
        </Suspense>
      </div>
    </main>
  );
}