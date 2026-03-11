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

// automation-note [2026-03-12T02:50:46.484014]
// Add note for profile settings validation test scenarios.

// automation-note [2026-03-12T02:51:02.735820]
// Revert note for merged PR #15; cleanup after automation demonstration.
