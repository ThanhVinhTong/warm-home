'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { inter } from '@/app/ui/fonts';

export default function CityComparisonChart() {
  const [data, setData] = useState<{ state: string; avgMedianPrice: number }[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/data/city-comparison');
        if (!res.ok) throw new Error('Failed to fetch data');
        const data = await res.json();
        setData(data);
      } catch (error) {
        console.error('Failed to fetch comparison data:', error);
      }
    }
    fetchData();
  }, []);

  return (
    <div className={inter.className}>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <XAxis dataKey="state" />
          <YAxis />
          <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
          <Bar dataKey="avgMedianPrice" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}