// Adapt from cards.tsx
import {
  BanknotesIcon,
  HomeIcon, // Adjusted icons
  ChartBarIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import { fetchSuburbOverviews, fetchProperties } from '@/app/lib/data';

const iconMap = {
  suburbs: MapPinIcon,
  properties: HomeIcon,
  avgPrice: ChartBarIcon,
  totalValue: BanknotesIcon,
};

export default async function SummaryCards() {
  const suburbs = await fetchSuburbOverviews();
  const properties = await fetchProperties();

  const numberOfSuburbs = suburbs.length;
  const numberOfProperties = properties.length;
  const avgPrice = (properties.reduce((sum, p) => sum + p.price, 0) / numberOfProperties || 0).toFixed(0);
  const totalValue = properties.reduce((sum, p) => sum + p.price, 0).toLocaleString();

  return (
    <>
      <Card title="Suburbs" value={numberOfSuburbs || 'N/A'} type="suburbs" />
      <Card title="Properties" value={numberOfProperties || 'N/A'} type="properties" />
      <Card title="Avg Price" value={avgPrice ? `$${Number(avgPrice).toLocaleString()}` : 'N/A'} type="avgPrice" />
      <Card title="Total Value" value={totalValue ? `$${totalValue}` : 'N/A'} type="totalValue" />
    </>
  );
}

export function Card({
  title,
  value,
  type,
}: {
  title: string;
  value: number | string;
  type: 'suburbs' | 'properties' | 'avgPrice' | 'totalValue';
}) {
  const Icon = iconMap[type];

  return (
    <div className="rounded-xl bg-gray-50 p-2 shadow-sm">
      <div className="flex p-4">
        {Icon ? <Icon className="h-5 w-5 text-gray-700" /> : null}
        <h3 className="ml-2 text-sm font-medium">{title}</h3>
      </div>
      <p
        className={`${lusitana.className}
          truncate rounded-xl bg-white px-4 py-8 text-center text-2xl`}
      >
        {value}
      </p>
    </div>
  );
}
