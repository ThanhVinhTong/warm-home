'use client';

import { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MagnifyingGlassIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { inter } from '@/app/ui/fonts';

export default function LineGraphSection() {
  const [states, setStates] = useState<string[]>([]);
  const [suburbs, setSuburbs] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedSuburb, setSelectedSuburb] = useState<string>('');
  const [data, setData] = useState<{ year: number; price: number }[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingSuburbs, setIsLoadingSuburbs] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch states on component mount
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

  // Fetch suburbs when state changes
  useEffect(() => {
    async function fetchSuburbs() {
      if (!selectedState) {
        setSuburbs([]);
        setSelectedSuburb('');
        setSearchTerm('');
        return;
      }

      setIsLoadingSuburbs(true);
      try {
        const res = await fetch(`/api/data/suburbs?state=${encodeURIComponent(selectedState)}`);
        if (!res.ok) throw new Error('Failed to fetch suburbs');
        const data = await res.json();
        setSuburbs(data);
        setSelectedSuburb('');
        setSearchTerm('');
      } catch (error) {
        console.error('Failed to fetch suburbs:', error);
        setSuburbs([]);
      } finally {
        setIsLoadingSuburbs(false);
      }
    }
    fetchSuburbs();
  }, [selectedState]);

  // Fetch data when suburb changes
  useEffect(() => {
    async function fetchData() {
      if (!selectedSuburb) {
        setData([]);
        return;
      }

      try {
        const url = `/api/data/line-graph?suburb=${encodeURIComponent(selectedSuburb)}`;
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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter suburbs based on search term
  const filteredSuburbs = suburbs.filter(suburb =>
    suburb.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSuburbSelect = (suburb: string) => {
    setSelectedSuburb(suburb);
    setSearchTerm(suburb);
    setIsDropdownOpen(false);
  };

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setSelectedSuburb('');
    setSearchTerm('');
    setData([]);
  };

  return (
    <div className={inter.className}>
      {/* State Selection */}
      <div className="mb-4">
        <label htmlFor="state-select" className="block text-sm font-medium text-gray-700 mb-2">
          Select State
        </label>
        <select
          id="state-select"
          value={selectedState}
          onChange={(e) => handleStateChange(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 text-sm md:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Choose a state ...</option>
          {states.map((state) => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
      </div>

      {/* Suburb Search (only show if state is selected) */}
      {selectedState && (
        <div className="mb-4">
          <label htmlFor="suburb-search" className="block text-sm font-medium text-gray-700 mb-2">
            Search Suburbs in {selectedState}
          </label>
          <div className="relative" ref={dropdownRef}>
            <div className="relative">
              <input
                id="suburb-search"
                type="text"
                placeholder={`Search suburbs in ${selectedState}...`}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                disabled={isLoadingSuburbs}
                className="w-full p-3 pr-10 border border-gray-300 rounded-lg bg-white text-gray-800 text-sm md:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            
            {/* Loading indicator */}
            {isLoadingSuburbs && (
              <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
            
            {/* Dropdown */}
            {isDropdownOpen && !isLoadingSuburbs && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredSuburbs.length > 0 ? (
                  filteredSuburbs.map((suburb) => (
                    <div
                      key={suburb}
                      onClick={() => handleSuburbSelect(suburb)}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                    >
                      {suburb}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500 text-sm">
                    {searchTerm ? 'No suburbs found' : 'No suburbs available in this state'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selected Suburb Display */}
      {selectedSuburb && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Selected:</span> {selectedSuburb}, {selectedState}
          </p>
        </div>
      )}

      {/* Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart 
          data={data}
        >
          <XAxis 
            dataKey="year" 
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            width={60}
          />
          <Tooltip 
            formatter={(value: number) => `$${value.toLocaleString()}`}
            labelStyle={{ fontSize: 12 }}
          />
          <Line type="monotone" dataKey="price" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}