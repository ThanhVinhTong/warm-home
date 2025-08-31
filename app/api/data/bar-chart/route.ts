import { NextResponse } from 'next/server';
import { getBarChartData } from '@/app/lib/data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state') || undefined;
    
    const data = await getBarChartData(state);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching bar chart data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
