import { NextRequest, NextResponse } from 'next/server';
import { getFeedItems } from '@/lib/blobs/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all';
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const items = await getFeedItems(limit, category);

    return NextResponse.json({
      count: items.length,
      category,
      items,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to fetch feed', details: err.message },
      { status: 500 }
    );
  }
}
