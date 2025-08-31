'use client';

import { useState, useEffect } from 'react';
import { inter } from '@/app/ui/fonts';

export default function StatsSection() {
  const [states, setStates] = useState<string[]>([]);
  const [suburbs, setSuburbs] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedSuburb, setSelectedSuburb] = useState<string>('');
  const [stats, setStats] = useState({ minPrice: 0, maxPrice: 0, avgPrice: 0 });
  const [isLoading, setIsLoading] = useState(false);

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
      if (!selectedState) {
        setSuburbs([]);
        setSelectedSuburb('');
        return;
      }

      try {
        const url = `/api/data/suburbs?state=${encodeURIComponent(selectedState)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch suburbs');
        const data = await res.json();
        setSuburbs(data);
        setSelectedSuburb('');
      } catch (error) {
        console.error('Failed to fetch suburbs:', error);
        setSuburbs([]);
      }
    }
    fetchSuburbs();
  }, [selectedState]);

  useEffect(() => {
    async function fetchStats() {
      if (!selectedState) {
        setStats({ minPrice: 0, maxPrice: 0, avgPrice: 0 });
        return;
      }

      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('state', selectedState);
        if (selectedSuburb) params.append('suburb', selectedSuburb);
        
        const url = `/api/data/stats?${params.toString()}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch stats');
        const data = await res.json();
        setStats({
          minPrice: data.minPrice ?? 0,
          maxPrice: data.maxPrice ?? 0,
          avgPrice: data.avgPrice ?? 0,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setStats({ minPrice: 0, maxPrice: 0, avgPrice: 0 });
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, [selectedState, selectedSuburb]);

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setSelectedSuburb('');
    setStats({ minPrice: 0, maxPrice: 0, avgPrice: 0 });
  };

  const handleSuburbChange = (suburb: string) => {
    setSelectedSuburb(suburb);
  };

  return (
    <div className={inter.className}>
      {/* State Selection */}
      <div className="mb-4">
        <label htmlFor="state-select-stats" className="block text-sm font-medium text-gray-700 mb-2">
          Select State to View Price Statistics
        </label>
        <select
          id="state-select-stats"
          value={selectedState}
          onChange={(e) => handleStateChange(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 text-sm md:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select State</option>
          {states.map((state) => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
      </div>

      {/* Suburb Selection (only show if state is selected) */}
      {selectedState && (
        <div className="mb-4">
          <label htmlFor="suburb-select-stats" className="block text-sm font-medium text-gray-700 mb-2">
            Select Suburb (Optional) - {selectedState}
          </label>
          <select
            id="suburb-select-stats"
            value={selectedSuburb}
            onChange={(e) => handleSuburbChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 text-sm md:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Suburbs in {selectedState}</option>
            {suburbs.map((suburb) => (
              <option key={suburb} value={suburb}>{suburb}</option>
            ))}
          </select>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-blue-800">
              Loading statistics for {selectedSuburb ? `${selectedSuburb}, ${selectedState}` : selectedState}...
            </span>
          </div>
        </div>
      )}

      {/* No State Selected Message */}
      {!selectedState && !isLoading && (
        <div className="mb-4 p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <div className="text-gray-500 mb-2">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a State</h3>
          <p className="text-gray-600">Choose a state above to view price statistics</p>
        </div>
      )}

      {/* Stats Display - Only show when data is available */}
      {selectedState && !isLoading && (
        <>
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <span className="font-medium">Showing:</span> Price statistics for {selectedSuburb ? selectedSuburb : `all suburbs`} in {selectedState}
            </p>
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
        </>
      )}
    </div>
  );
}