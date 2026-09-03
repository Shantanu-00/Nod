import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getCommentsForArticle, addCommentToArticle } from '@/lib/blobs/client';
import { CommentItem } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const comments = await getCommentsForArticle(params.id);
    return NextResponse.json({ comments });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to fetch comments', details: err.message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { content, author } = body;

    if (!content || typeof content !== 'string' || content.trim().length < 2) {
      return NextResponse.json(
        { error: 'Comment must be at least 2 characters.' },
        { status: 400 }
      );
    }

    const comment: CommentItem = {
      id: uuidv4(),
      articleId: params.id,
      content: content.trim(),
      author: author || { id: 'anon', name: 'Anonymous Reader' },
      createdAt: new Date().toISOString(),
    };

    await addCommentToArticle(comment);

    return NextResponse.json({ success: true, comment }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to add comment', details: err.message },
      { status: 500 }
    );
  }
}
