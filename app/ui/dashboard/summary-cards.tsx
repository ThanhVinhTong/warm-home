// Adapt from cards.tsx
import {
  BanknotesIcon,
  HomeIcon,
  ChartBarIcon,
  MapPinIcon,
  FlagIcon,
} from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';

const iconMap = {
  states: FlagIcon,
  suburbs: MapPinIcon,
  properties: HomeIcon,
  avgPrice: ChartBarIcon,
};

export default async function SummaryCards() {
  // Fetch data from API routes
  const [statesRes, suburbsRes, propertiesRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/data/states`, {
      cache: 'no-store'
    }),
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/data/suburb-overviews`, {
      cache: 'no-store'
    }),
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/data/properties`, {
      cache: 'no-store'
    })
  ]);
  
  if (!statesRes.ok || !suburbsRes.ok || !propertiesRes.ok) {
    throw new Error('Failed to fetch data');
  }
  
  const states = await statesRes.json();
  const suburbs = await suburbsRes.json();
  const properties = await propertiesRes.json();

  const numberOfStates = states.length;
  const numberOfSuburbs = suburbs.length;
  const numberOfHouses = properties.length;
  
  // Calculate average price across all states
  const totalPrice = properties.reduce((sum: number, p: any) => sum + p.price, 0);
  const avgPrice = numberOfHouses > 0 ? (totalPrice / numberOfHouses).toFixed(0) : '0';

  return (
    <>
      <Card title="States" value={numberOfStates || 'N/A'} type="states" />
      <Card title="Suburbs" value={numberOfSuburbs || 'N/A'} type="suburbs" />
      <Card title="Houses" value={numberOfHouses || 'N/A'} type="properties" />
      <Card title="Avg Price" value={avgPrice ? `$${Number(avgPrice).toLocaleString()}` : 'N/A'} type="avgPrice" />
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
  type: 'states' | 'suburbs' | 'properties' | 'avgPrice';
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
