// This file contains type definitions for your data.
// It describes the shape of the data, and what data type each property should accept.
// For simplicity of teaching, we're manually defining these types.
// However, these types are generated automatically if you're using an ORM such as Prisma.
export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  isTechDisadvantaged?: boolean; // Optional flag for users needing simplified tech interactions
};

// Add type for Suburb (for price overviews and analysis)
export type Suburb = {
  id: string;
  name: string;
  state: string;
  medianHousePrice: number;
  averageRent: number;
  population: number;
  growthRate: number; // Yearly price growth percentage
};

// Add type for Property (for house finding via Domain APIs)
export type Property = {
  id: string;
  suburbId: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  type: string; // e.g., 'House', 'Apartment'
  status: string; // e.g., 'For Sale', 'For Rent', 'Sold'
  description: string;
};
