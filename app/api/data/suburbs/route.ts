import { NextResponse } from 'next/server';
import { getSuburbs } from '@/app/lib/data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state') || undefined;
    
    const data = await getSuburbs(state);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching suburbs data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
