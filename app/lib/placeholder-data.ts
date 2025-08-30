// This file contains placeholder data that you'll be replacing with real data in the Data Fetching chapter:
// https://nextjs.org/learn/dashboard-app/fetching-data

// Merge additional sample users (including some with 'disadvantaged' flag for chatbot testing)
// warm-home/lib/placeholder-data.ts
import { randomUUID } from 'crypto';

export const users = [
  {
    id: "u1",
    name: "Alice Nguyen",
    email: "alice@example.com",
    password: "password123", // will be hashed
    isTechDisadvantaged: true,
  },
  {
    id: "u2",
    name: "Bob Tran",
    email: "bob@example.com",
    password: "password456",
  },
];

const states: Record<string, string[]> = {
  VIC: ["Footscray", "Richmond", "Carlton", "St Kilda", "Brunswick", "Hawthorn", "Fitzroy", "South Yarra", "Docklands", "Melton"],
  NSW: ["Parramatta", "Liverpool", "Penrith", "Chatswood", "Manly", "Bondi", "Newtown", "Burwood", "Bankstown", "Blacktown"],
  QLD: ["South Brisbane", "Fortitude Valley", "Sunnybank", "Chermside", "Logan", "Ipswich", "Springfield", "Cairns North", "Townsville", "Toowoomba"],
  WA: ["Fremantle", "Joondalup", "Cottesloe", "Scarborough", "Subiaco", "Claremont", "Mandurah", "Armadale", "Rockingham", "Bunbury"],
  SA: ["Glenelg", "Norwood", "Prospect", "Semaphore", "Mawson Lakes", "Unley", "Henley Beach", "Burnside", "Elizabeth", "Port Adelaide"],
  TAS: ["Hobart", "Launceston", "Devonport", "Burnie", "Glenorchy", "Kingston", "New Norfolk", "Ulverstone", "George Town", "Scottsdale"],
  NT: ["Darwin", "Palmerston", "Alice Springs", "Katherine", "Nhulunbuy", "Tennant Creek", "Humpty Doo", "Howard Springs", "Berry Springs", "Coolalinga"],
  ACT: ["Belconnen", "Woden", "Gungahlin", "Tuggeranong", "Kingston", "Manuka", "Braddon", "Narrabundah", "Watson", "Lyneham"]
};

function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// --- Generate suburbs ---
export const suburbs: any[] = [];
export const properties: any[] = [];

for (const [state, suburbList] of Object.entries(states)) {
  for (const suburb of suburbList) {
    const suburbId = `${state}-${suburb.replace(/\s+/g, "").toLowerCase()}`;

    suburbs.push({
      id: suburbId,
      name: suburb,
      state,
      medianHousePrice: random(500000, 1500000),
      averageRent: random(300, 800),
      population: random(5000, 50000),
      growthRate: parseFloat((Math.random() * 7).toFixed(1)), // 0–7%
    });

    // --- Generate 10 properties per suburb ---
    for (let i = 0; i < 10; i++) {
      properties.push({
        id: `${suburbId}-p${i}`,
        suburbId,
        address: `${random(1, 200)} ${suburb} St, ${suburb} ${state}`,
        price: random(400000, 2000000),
        bedrooms: random(1, 5),
        bathrooms: random(1, 3),
        type: ["House", "Apartment", "Townhouse"][random(0, 2)],
        status: ["For Sale", "Sold", "For Rent"][random(0, 2)],
        description: `Lovely ${suburb} property with great amenities.`,
        date: new Date(Date.now() - random(0, 365) * 24 * 60 * 60 * 1000),
      });
    }
  }
}
