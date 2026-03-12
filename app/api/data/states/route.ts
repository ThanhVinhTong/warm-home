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

// automation-note [2026-03-13T00:28:55.250865]
// Add note for profile settings validation test scenarios.

// automation-note [2026-03-13T00:29:13.075185]
// Revert note for merged PR #24; cleanup after automation demonstration.
