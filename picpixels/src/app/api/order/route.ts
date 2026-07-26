import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const contentType = request.headers.get('content-type') || '';

  let body: Record<string, unknown> = {};
  if (contentType.includes('application/json')) {
    try {
      body = await request.json();
    } catch {
      body = {};
    }
  } else {
    const formData = await request.formData();
    for (const [key, value] of formData.entries()) {
      if (key === 'features') {
        try {
          body[key] = JSON.parse(value as string);
        } catch {
          body[key] = (value as string).split(',').map((s) => s.trim()).filter(Boolean);
        }
      } else {
        body[key] = value;
      }
    }
  }

  const response = NextResponse.redirect(new URL('/order-summary', request.url), 303);
  response.cookies.set('order_summary', JSON.stringify(body), {
    path: '/',
    maxAge: 60 * 10,
    httpOnly: false,
    sameSite: 'lax',
  });

  return response;
}
