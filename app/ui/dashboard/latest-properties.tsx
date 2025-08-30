// Adapt from latest-invoices.tsx
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Image from 'next/image';
import { lusitana } from '@/app/ui/fonts';
import { Property } from '@/app/lib/definitions';
import { fetchProperties } from '@/app/lib/data';

export default async function LatestProperties() {
  const properties = await fetchProperties(); // Fetch all or limit to latest
  // Optionally sort by some 'date' field if added to Property type

  // Limit to latest 5 (add date field to Property type later for real sorting)
  const latestProperties = properties.slice(0, 5);

  return (
    <div className="flex w-full flex-col md:col-span-4 lg:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Latest Properties
      </h2>
      <div className="flex grow flex-col justify-between rounded-xl bg-gray-50 p-4">
        <div className="bg-white px-6">
          {latestProperties.map((property, i) => {
            return (
              <div
                key={property.id}
                className={clsx(
                  'flex flex-row items-center justify-between py-4',
                  {
                    'border-t': i !== 0,
                  },
                )}
              >
                <div className="flex items-center">
                  {/* Assuming no image for properties; add placeholder or adjust */}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold md:text-base">
                      {property.address} ({property.type}, {property.status})
                    </p>
                    <p className="hidden text-sm text-gray-500 sm:block">
                      {property.description} - {property.bedrooms} beds, {property.bathrooms} baths
                    </p>
                  </div>
                </div>
                <p
                  className={`${lusitana.className} truncate text-sm font-medium md:text-base`}
                >
                  ${property.price.toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
        <div className="flex items-center pb-2 pt-6">
          <ArrowPathIcon className="h-5 w-5 text-gray-500" />
          <h3 className="ml-2 text-sm text-gray-500 ">Updated just now</h3>
        </div>
      </div>
    </div>
  );
}
