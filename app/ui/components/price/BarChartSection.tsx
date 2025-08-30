'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

import { inter } from '@/app/ui/fonts';

export default function BarChartSection() {
  const [states, setStates] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>('');
  const [data, setData] = useState<{ suburb: string; medianPrice: number }[]>([]);

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
    async function fetchData() {
      try {
        const url = selectedState ? `/api/data/bar-chart?state=${encodeURIComponent(selectedState)}` : '/api/data/bar-chart';
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch data');
        const data = await res.json();
        setData(data);
      } catch (error) {
        console.error('Failed to fetch bar chart data:', error);
      }
    }
    fetchData();
  }, [selectedState]);

  return (
    <div className={inter.className}>
      <select
        value={selectedState}
        onChange={(e) => setSelectedState(e.target.value)}
        className="mb-4 p-3 border rounded-lg bg-white text-gray-800 text-sm md:text-base"
      >
        <option value="">All States</option>
        {states.map((state) => (
          <option key={state} value={state}>{state}</option>
        ))}
      </select>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <XAxis dataKey="suburb" />
          <YAxis />
          <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
          <Bar dataKey="medianPrice" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}