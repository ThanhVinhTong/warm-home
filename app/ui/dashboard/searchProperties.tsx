'use client';

import { useState } from 'react';

export type Listing = {
  _id: string;
  address: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  suburbId?: string;
};

export default function SearchProperty() {
  const [region, setRegion] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [results, setResults] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSearch = async () => {
    setLoading(true);
    setErr(null);

    try {
      const qs = new URLSearchParams();
      if (region) qs.set('region', region);
      if (minPrice) qs.set('min', minPrice);
      if (maxPrice) qs.set('max', maxPrice);

      const res = await fetch(`/api/data/search?${qs.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setResults(data.items ?? []);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-12 space-y-6">
      <h2 className="text-2xl font-bold">Search Properties</h2>

      {/* Filter Form */}
      <div className="flex gap-3 flex-wrap">
        <input
          className="rounded border px-3 py-2"
          placeholder="Region/Suburb (e.g. Perth)"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        />
        <input
          className="rounded border px-3 py-2"
          placeholder="Min Price"
          inputMode="numeric"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <input
          className="rounded border px-3 py-2"
          placeholder="Max Price"
          inputMode="numeric"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
        <button
          type="button"
          className="rounded bg-blue-500 px-4 py-2 text-white"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? 'Searching…' : 'Search'}
        </button>
      </div>

      {/* Results */}
      {err && <p className="text-red-600 text-sm">Error: {err}</p>}
      {!loading && !err && results.length === 0 && (
        <p className="text-gray-500">No results yet.</p>
      )}
      {loading && <p>Loading…</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {results.map((l) => (
          <div key={l._id} className="rounded-lg border shadow-sm p-3">
            <div className="font-semibold">
              {typeof l.price === 'number' ? `A$ ${l.price.toLocaleString()}` : 'Contact agent'}
            </div>
            <div className="text-sm text-gray-700">{l.address}</div>
            <div className="text-xs text-gray-500">
              {(l.bedrooms ?? 0)} bed · {(l.bathrooms ?? 0)} bath
            </div>
            <div className="text-xs text-gray-400">{l.suburbId}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

