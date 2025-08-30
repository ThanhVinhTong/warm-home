import { NextResponse } from 'next/server';
import { fetchSuburbOverviews } from '@/app/lib/db/mongodb';

export async function GET() {
  try {
    const data = await fetchSuburbOverviews();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching suburb overviews:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
