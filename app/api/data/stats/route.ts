import { NextResponse } from 'next/server';
import { getStats } from '@/app/lib/data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state') || undefined;
    const suburb = searchParams.get('suburb') || undefined;
  
    const data = await getStats({ state, suburb });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching stats data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
