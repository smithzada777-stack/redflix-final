import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const url = new URL(req.url);
    console.log('--- REDIRECTING WEBHOOK FROM:', url.pathname);

    // Redirect all legacy webhook calls to the new path
    return fetch(new URL('/api/webhook/pix', req.url), {
        method: 'POST',
        headers: req.headers,
        body: await req.blob()
    });
}
