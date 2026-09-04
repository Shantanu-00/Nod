import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { calculateReadingMetrics } from '@/lib/utils/a11y-metrics';
import { saveArticle } from '@/lib/blobs/client';
import { ArticleDetail } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, category = 'strategies', tags = [], author } = body;

    if (!title || typeof title !== 'string' || title.trim().length < 3) {
      return NextResponse.json({ error: 'Title must be at least 3 characters.' }, { status: 400 });
    }

    if (!content || typeof content !== 'string' || content.trim().length < 10) {
      return NextResponse.json({ error: 'Content must be at least 10 characters.' }, { status: 400 });
    }

    const id = uuidv4();
    const metrics = calculateReadingMetrics(content);

    const authorObj = author || {
      id: 'author-guest',
      name: 'Community Voice',
      handle: '@community',
    };

    const cleanMarkdown = content.trim();
    // Generate clean sentence summary rather than cutting off at 160 characters
    let cleanSummary = body.summary;
    if (!cleanSummary || typeof cleanSummary !== 'string') {
      const plainText = cleanMarkdown.replace(/[#*`_>]/g, '').replace(/\n+/g, ' ').trim();
      const sentenceMatch = plainText.match(/[^.!?]+[.!?]/);
      cleanSummary = sentenceMatch ? sentenceMatch[0].trim() : plainText.slice(0, 140).trim();
    }

    const article: ArticleDetail = {
      id,
      title: title.trim(),
      summary: cleanSummary,
      author: authorObj,
      category,
      tags: Array.isArray(tags) ? tags : [],
      metrics,
      content: {
        rawMarkdown: cleanMarkdown,
        agentSummary: body.agentSummary || undefined,
        keyTakeaways: Array.isArray(body.keyTakeaways) && body.keyTakeaways.length > 0 ? body.keyTakeaways : [],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      commentCount: 0,
      likesCount: 1,
    };

    const { feedKey } = await saveArticle(article);

    return NextResponse.json(
      { success: true, id, feedKey, article },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to create article', details: err.message },
      { status: 500 }
    );
  }
}
