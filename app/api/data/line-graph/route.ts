import { NextResponse } from 'next/server';
import { getLineGraphData } from '@/app/lib/data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const suburb = searchParams.get('suburb') || undefined;
    
    const data = await getLineGraphData(suburb);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching line graph data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
