// This file contains placeholder data that you'll be replacing with real data in the Data Fetching chapter:
// https://nextjs.org/learn/dashboard-app/fetching-data

// Merge additional sample users (including some with 'disadvantaged' flag for chatbot testing)
const users = [
  {
    id: '410544b2-4001-4271-9855-fec4b6a6442a',
    name: 'User',
    email: 'user@nextmail.com',
    password: '123456',
    isTechDisadvantaged: false, // Flag for chatbot personalization
  },
  {
    id: '410544b2-4001-4271-9855-fec4b6a6442b',
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'password123',
    isTechDisadvantaged: true,
  },
];

// Sample Australian suburbs with price overviews (mimicking Domain's Locations API)
const suburbs = [
  {
    id: 'suburb-1',
    name: 'Sydney CBD',
    state: 'NSW',
    medianHousePrice: 1500000,
    averageRent: 800,
    population: 20000,
    growthRate: 2.5, // Yearly price growth %
  },
  {
    id: 'suburb-2',
    name: 'Melbourne City',
    state: 'VIC',
    medianHousePrice: 1200000,
    averageRent: 700,
    population: 18000,
    growthRate: 3.0,
  },
  {
    id: 'suburb-3',
    name: 'Brisbane CBD',
    state: 'QLD',
    medianHousePrice: 900000,
    averageRent: 600,
    population: 15000,
    growthRate: 4.0,
  },
];

// Sample properties (mimicking Domain's Properties & Listings APIs)
const properties = [
  {
    id: 'property-1',
    suburbId: 'suburb-1',
    address: '123 Example St, Sydney CBD',
    price: 1600000,
    bedrooms: 3,
    bathrooms: 2,
    type: 'House',
    status: 'For Sale',
    description: 'Modern house in central Sydney with city views.',
  },
  {
    id: 'property-2',
    suburbId: 'suburb-2',
    address: '456 Sample Rd, Melbourne City',
    price: 1300000,
    bedrooms: 2,
    bathrooms: 1,
    type: 'Apartment',
    status: 'For Rent',
    description: 'Cozy apartment near Melbourne amenities.',
  },
  {
    id: 'property-3',
    suburbId: 'suburb-3',
    address: '789 Test Ave, Brisbane CBD',
    price: 950000,
    bedrooms: 4,
    bathrooms: 3,
    type: 'House',
    status: 'Sold',
    description: 'Spacious family home in Brisbane.',
  },
];

export { users, suburbs, properties };
