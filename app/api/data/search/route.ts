// app/api/listings/route.ts
import { NextResponse } from 'next/server';
import { dbConnect } from '@/app/lib/db/mongodb';
import type { Sort } from 'mongodb';

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const regionInput = (searchParams.get('region') || '').trim(); // e.g. 'footscray' or 'VIC-footscray'
  const min = Number(searchParams.get('min') || 0);
  const max = Number(searchParams.get('max') || Number.MAX_SAFE_INTEGER);

  const { db } = await dbConnect();

  // suburbId matching rules:
  // - If user input is 'footscray': /-footscray$/i
  // - In case 'VIC-footscray': /^VIC-footscray$/i
  let suburbIdCond: any | undefined;
  if (regionInput) {
    if (regionInput.includes('-')) {
      suburbIdCond = { $regex: `^${escapeRegex(regionInput)}$`, $options: 'i' };
    } else {
      suburbIdCond = { $regex: `-${escapeRegex(regionInput)}$`, $options: 'i' };
    }
  }

  const query: any = {
    price: { $gte: min, $lte: max },
  };
  if (suburbIdCond) query.suburbId = suburbIdCond;

  const sort: Sort = { date: -1, price: -1 };


  const items = await db
    .collection('properties')
    .find(query)
    .sort(sort)
    .limit(50) 
    .toArray();

  return NextResponse.json({
    items, // ex: { id, suburbId, address, price, bedrooms, bathrooms, type, status, description, date, ... }
    total: items.length,
    query,
  });
}

