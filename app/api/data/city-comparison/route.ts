import { NextResponse } from 'next/server';
import { getCityComparisonData } from '@/app/lib/data';

export async function GET() {
  try {
    const data = await getCityComparisonData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching city comparison data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
