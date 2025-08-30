'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

import { inter } from '@/app/ui/fonts';

export default function LineGraphSection() {
  const [suburbs, setSuburbs] = useState<string[]>([]);
  const [selectedSuburb, setSelectedSuburb] = useState<string>('');
  const [data, setData] = useState<{ year: number; price: number }[]>([]);

  useEffect(() => {
    async function fetchSuburbs() {
      try {
        const res = await fetch('/api/data/suburbs');
        if (!res.ok) throw new Error('Failed to fetch suburbs');
        const data = await res.json();
        setSuburbs(data);
      } catch (error) {
        console.error('Failed to fetch suburbs:', error);
      }
    }
    fetchSuburbs();
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const url = selectedSuburb ? `/api/data/line-graph?suburb=${encodeURIComponent(selectedSuburb)}` : '/api/data/line-graph';
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch data');
        const data = await res.json();
        // Map the API response to match the expected data shape
        const mappedData = data.map((item: { year: any; avgPrice: any }) => ({
          year: Number(item.year),
          price: Number(item.avgPrice),
        }));
        setData(mappedData);
      } catch (error) {
        console.error('Failed to fetch line graph data:', error);
      }
    }
    fetchData();
  }, [selectedSuburb]);

  return (
    <div className={inter.className}>
      <select
        value={selectedSuburb}
        onChange={(e) => setSelectedSuburb(e.target.value)}
        className="mb-4 p-3 border rounded-lg bg-white text-gray-800 text-sm md:text-base"
      >
        <option value="">Select Suburb</option>
        {suburbs.map((suburb) => (
          <option key={suburb} value={suburb}>{suburb}</option>
        ))}
      </select>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
          <Line type="monotone" dataKey="price" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}