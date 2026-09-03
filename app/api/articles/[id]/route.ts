import { NextRequest, NextResponse } from 'next/server';
import { getArticleById } from '@/lib/blobs/client';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const article = await getArticleById(id);

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to fetch article', details: err.message },
      { status: 500 }
    );
  }
}
