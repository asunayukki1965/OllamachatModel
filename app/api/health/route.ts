export const runtime = "nodejs";

export async function GET() {
  const target = process.env.LLAMAFILE_URL || "http://localhost:8080/v1/chat/completions";
  const base = target.replace(/\/v1\/chat\/completions\/?$/, "");

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${base}/v1/models`, { signal: controller.signal }).catch(
      () => fetch(base, { signal: controller.signal })
    );
    clearTimeout(timeout);
    return Response.json({ online: !!res && res.ok, target: base });
  } catch {
    return Response.json({ online: false, target: base });
  }
}
