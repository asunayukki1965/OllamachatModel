import { NextRequest, NextResponse } from "next/server";

// Allow the LinguaBuddy frontend (on Vercel) to call /api/* cross-origin.
// Set FRONTEND_ORIGIN on Render to your Vercel URL to restrict access.
export function middleware(req: NextRequest) {
  const headers = {
    "Access-Control-Allow-Origin": process.env.FRONTEND_ORIGIN || "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers });
  }

  const res = NextResponse.next();
  for (const [k, v] of Object.entries(headers)) res.headers.set(k, v);
  return res;
}

export const config = { matcher: "/api/:path*" };
