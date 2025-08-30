import { NextResponse } from 'next/server';
import { getStates } from '@/app/lib/data';

export async function GET() {
  try {
    const data = await getStates();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching states data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
