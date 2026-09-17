import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const target = process.env.LLAMAFILE_URL || "http://localhost:8080/v1/chat/completions";
  const apiKey = process.env.LLAMAFILE_API_KEY;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Request body must be JSON." }),
      { status: 400, headers: { "content-type": "application/json" } }
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not reach the llamafile server.";
    return new Response(
      JSON.stringify({
        error: `Couldn't reach your llamafile server at ${target}. Is it running? (${message})`,
      }),
      { status: 502, headers: { "content-type": "application/json" } }
    );
  }

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => "");
    return new Response(
      JSON.stringify({
        error: `llamafile server responded with ${upstream.status}. ${text}`.trim(),
      }),
      { status: 502, headers: { "content-type": "application/json" } }
    );
  }

  // Pass the upstream SSE stream straight through to the browser.
  return new Response(upstream.body, {
    status: 200,
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
      connection: "keep-alive",
    },
  });
}
