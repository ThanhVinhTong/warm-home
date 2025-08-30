import { NextResponse } from 'next/server';
import { fetchProperties } from '@/app/lib/db/mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '{}';
    
    const properties = await fetchProperties(JSON.parse(query));
    return NextResponse.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}
