'use client';

import { useState, useEffect } from 'react';

import { inter } from '@/app/ui/fonts';

export default function StatsSection() {
  const [states, setStates] = useState<string[]>([]);
  const [suburbs, setSuburbs] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedSuburb, setSelectedSuburb] = useState<string>('');
  const [stats, setStats] = useState({ minPrice: 0, maxPrice: 0, avgPrice: 0 });

  useEffect(() => {
    async function fetchStates() {
      try {
        const res = await fetch('/api/data/states');
        if (!res.ok) throw new Error('Failed to fetch states');
        const data = await res.json();
        setStates(data);
      } catch (error) {
        console.error('Failed to fetch states:', error);
      }
    }
    fetchStates();
  }, []);

  useEffect(() => {
    async function fetchSuburbs() {
      try {
        const url = selectedState ? `/api/data/suburbs?state=${encodeURIComponent(selectedState)}` : '/api/data/suburbs';
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch suburbs');
        const data = await res.json();
        setSuburbs(data);
        setSelectedSuburb('');
      } catch (error) {
        console.error('Failed to fetch suburbs:', error);
      }
    }
    if (selectedState) fetchSuburbs();
  }, [selectedState]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const params = new URLSearchParams();
        if (selectedState) params.append('state', selectedState);
        if (selectedSuburb) params.append('suburb', selectedSuburb);
        
        const url = `/api/data/stats?${params.toString()}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch stats');
        const data = await res.json();
        // Ensure res has the expected shape, or map it accordingly
        setStats({
          minPrice: data.minPrice ?? 0,
          maxPrice: data.maxPrice ?? 0,
          avgPrice: data.avgPrice ?? 0,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    }
    fetchStats();
  }, [selectedState, selectedSuburb]);

  return (
    <div className={inter.className}>
      <div className="flex space-x-4 mb-4">
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="p-3 border rounded-lg bg-white text-gray-800 text-sm md:text-base"
        >
          <option value="">All States</option>
          {states.map((state) => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
        <select
          value={selectedSuburb}
          onChange={(e) => setSelectedSuburb(e.target.value)}
          className="p-3 border rounded-lg bg-white text-gray-800 text-sm md:text-base"
          disabled={!selectedState}
        >
          <option value="">All Suburbs</option>
          {suburbs.map((suburb) => (
            <option key={suburb} value={suburb}>{suburb}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg bg-white">
          <h3 className="font-semibold text-gray-800">Min Price</h3>
          <p className="text-gray-600">${stats.minPrice.toLocaleString()}</p>
        </div>
        <div className="p-4 border rounded-lg bg-white">
          <h3 className="font-semibold text-gray-800">Max Price</h3>
          <p className="text-gray-600">${stats.maxPrice.toLocaleString()}</p>
        </div>
        <div className="p-4 border rounded-lg bg-white">
          <h3 className="font-semibold text-gray-800">Avg Price</h3>
          <p className="text-gray-600">${stats.avgPrice.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}