import { NextRequest } from "next/server";

export const runtime = "nodejs";

// LinguaBuddy tutor endpoint: takes { system, messages } and returns
// { content: [{ type: "text", text }] } (the shape VoiceInterface.jsx expects).
export async function POST(req: NextRequest) {
  const target = process.env.LLAMAFILE_URL || "http://localhost:8080/v1/chat/completions";

  let system = "";
  let messages: { role: string; content: string }[] = [];
  try {
    ({ system = "", messages = [] } = await req.json());
  } catch {
    return Response.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const jsonSystem = `${system}

IMPORTANT: Output ONLY the raw JSON object described above. No markdown code fences, no preamble, no extra text before or after the JSON. /no_think`;

  try {
    const upstream = await fetch(target, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: "local",
        messages: [
          { role: "system", content: jsonSystem },
          ...messages.map((m) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: m.content,
          })),
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!upstream.ok) {
      return Response.json({ error: await upstream.text() }, { status: 502 });
    }

    const data = await upstream.json();
    const text = String(data?.choices?.[0]?.message?.content ?? "")
      .replace(/<think>[\s\S]*?<\/think>/g, "")
      .trim();
    return Response.json({ content: [{ type: "text", text }] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return Response.json({ error: `Couldn't reach llamafile: ${message}` }, { status: 502 });
  }
}
