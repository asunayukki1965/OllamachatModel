import { ChatMessage } from "./types";

interface StreamChatArgs {
  messages: ChatMessage[];
  model: string;
  temperature: number;
  onToken: (token: string) => void;
  signal?: AbortSignal;
}

export async function streamChat({
  messages,
  model,
  temperature,
  onToken,
  signal,
}: StreamChatArgs): Promise<void> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    signal,
    body: JSON.stringify({
      model,
      temperature,
      stream: true,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  if (!res.ok || !res.body) {
    let detail = "";
    try {
      const parsed = await res.json();
      detail = parsed.error || "";
    } catch {
      detail = await res.text().catch(() => "");
    }
    throw new Error(detail || `Request failed with status ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;

      const payload = trimmed.slice(5).trim();
      if (payload === "[DONE]") return;

      try {
        const json = JSON.parse(payload);
        const token: string | undefined = json?.choices?.[0]?.delta?.content;
        if (token) onToken(token);
      } catch {
        // some servers emit occasional non-JSON keep-alive lines; ignore them
      }
    }
  }
}
