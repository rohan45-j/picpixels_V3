// src/app/api/revalidate/route.ts
// On-demand revalidation endpoint called by Django admin after content updates.
// Supports revalidating by path, tag, or both simultaneously.

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { clearApiMemoryCache } from '@/services/public-api';

const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET || 'picpixels-revalidate-secret-2024';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret, paths, tags, type } = body as {
      secret?: string;
      paths?: string[];
      tags?: string[];
      type?: 'page' | 'layout';
    };

    // Verify secret token
    if (secret !== REVALIDATION_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Invalid revalidation secret' },
        { status: 401 }
      );
    }

    const revalidated: { paths: string[]; tags: string[] } = { paths: [], tags: [] };

    // Revalidate specific paths
    if (paths && Array.isArray(paths)) {
      for (const path of paths) {
        try {
          revalidatePath(path, type || 'page');
          revalidated.paths.push(path);
        } catch (err) {
          console.error(`[Revalidate] Failed to revalidate path: ${path}`, err);
        }
      }
    }

    // Revalidate specific cache tags
    if (tags && Array.isArray(tags)) {
      for (const tag of tags) {
        try {
          revalidateTag(tag);
          revalidated.tags.push(tag);
        } catch (err) {
          console.error(`[Revalidate] Failed to revalidate tag: ${tag}`, err);
        }
      }
    }

    // If no paths or tags specified, revalidate the entire site layout
    if ((!paths || paths.length === 0) && (!tags || tags.length === 0)) {
      revalidatePath('/', 'layout');
      revalidated.paths.push('/ (full layout)');
    }

    // Clear in-memory API cache
    clearApiMemoryCache();

    console.log(`[Revalidate] Successfully revalidated:`, revalidated);

    return NextResponse.json({
      success: true,
      revalidated,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Revalidate] Error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal revalidation error' },
      { status: 500 }
    );
  }
}

// Also support GET for easy testing/manual triggering
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  const path = request.nextUrl.searchParams.get('path');
  const tag = request.nextUrl.searchParams.get('tag');

  if (secret !== REVALIDATION_SECRET) {
    return NextResponse.json(
      { success: false, error: 'Invalid revalidation secret' },
      { status: 401 }
    );
  }

  const revalidated: { paths: string[]; tags: string[] } = { paths: [], tags: [] };

  if (path) {
    revalidatePath(path);
    revalidated.paths.push(path);
  }

  if (tag) {
    revalidateTag(tag);
    revalidated.tags.push(tag);
  }

  if (!path && !tag) {
    revalidatePath('/', 'layout');
    revalidated.paths.push('/ (full layout)');
  }

  // Clear in-memory API cache
  clearApiMemoryCache();

  return NextResponse.json({
    success: true,
    revalidated,
    timestamp: new Date().toISOString(),
  });
}
