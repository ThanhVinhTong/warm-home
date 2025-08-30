// Adapt from revenue-chart.tsx
import { generateYAxis } from '@/app/lib/utils'; // Assuming this is still useful
import { CalendarIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import { Suburb } from '@/app/lib/definitions';


export default async function PriceChart() {
  // Fetch suburbs from API route
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/data/suburb-overviews`, {
    cache: 'no-store'
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch suburbs');
  }
  
  const suburbs: Suburb[] = await res.json();
  const chartHeight = 350;

  // Sort suburbs by medianHousePrice descending for better visualization
  const sortedSuburbs = [...suburbs].sort((a, b) => b.medianHousePrice - a.medianHousePrice);

  // Update yAxis generation (assuming generateYAxis handles large numbers; format as currency if needed)
  const { yAxisLabels, topLabel } = generateYAxis(sortedSuburbs.map(s => s.medianHousePrice));

  return (
    <div className="w-full md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Suburb Median Prices
      </h2>
      <div className="rounded-xl bg-gray-50 p-4">
        <div className="sm:grid-cols-13 mt-0 grid grid-cols-12 items-end gap-2 rounded-md bg-white p-4 md:gap-4">
          <div
            className="mb-6 hidden flex-col justify-between text-sm text-gray-400 sm:flex"
            style={{ height: `${chartHeight}px` }}
          >
            {yAxisLabels.map((label) => (
              <p key={label}>{label}</p>
            ))}
          </div>

          {sortedSuburbs.map((suburb) => (
            <div key={suburb.id} className="flex flex-col items-center gap-2">
              <div
                className="w-full rounded-md bg-blue-300"
                style={{
                  height: `${(chartHeight / topLabel) * suburb.medianHousePrice}px`,
                }}
                title={`$${suburb.medianHousePrice.toLocaleString()}`}
              ></div>
              <p className="-rotate-90 text-sm text-gray-400 sm:rotate-0">
                {suburb.name}
              </p>
            </div>
          ))}
        </div>
        <div className="flex items-center pb-2 pt-6">
          <CalendarIcon className="h-5 w-5 text-gray-500" />
          <h3 className="ml-2 text-sm text-gray-500 ">Sample Australian Suburbs</h3>
        </div>
      </div>
    </div>
  );
}
