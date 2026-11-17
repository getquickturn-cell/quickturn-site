// QuickTurn: draft-invoice (Supabase Edge Function)
// Turns a mechanic's job notes + receipt photos into structured invoice data with Claude.
//
// Secrets to set in Supabase (Edge Functions > Secrets):
//   ANTHROPIC_API_KEY   your Anthropic API key (never put this in the website code)
//   ALLOWED_EMAILS      comma-separated emails allowed to use it, e.g. getquickturn@gmail.com,danny@example.com
//   ANTHROPIC_MODEL     optional; defaults to claude-sonnet-5-5
//   DEEPGRAM_API_KEY    turns texted voice memos into text
//   TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN   to download texted photos and voice memos
// SUPABASE_URL and SUPABASE_ANON_KEY are provided by Supabase automatically.

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

const SCHEMA = {
  type: "object",
  properties: {
    billTo: { type: "string", description: "Customer or company being billed" },
    billContact: { type: "string" },
    billAddress: { type: "string" },
    po: { type: "string", description: "Customer PO number" },
    date: { type: "string", description: "Job date as YYYY-MM-DD, or empty" },
    unit: { type: "string", description: "Fleet unit / truck number" },
    vehicle: { type: "string", description: "Year make model" },
    vin: { type: "string" },
    mileage: { type: "string" },
    work: { type: "string", description: "1-3 short professional sentences describing the work" },
    laborHours: { type: "number" },
    driveHours: { type: "number" },
    roadCall: { type: "boolean", description: "True only if a road call, service call or dispatch is mentioned" },
    parts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          desc: { type: "string" },
          qty: { type: "number" },
          cost: { type: "number", description: "What the mechanic paid per item, before markup" },
        },
        required: ["desc", "qty", "cost"],
      },
    },
    extras: {
      type: "array",
      items: { type: "object", properties: { desc: { type: "string" }, amount: { type: "number" } }, required: ["desc", "amount"] },
    },
    note: { type: "string", description: "Recommendations for future work" },
    questions: { type: "array", items: { type: "string" }, description: "Anything unclear the mechanic should confirm" },
  },
  required: ["billTo", "work", "laborHours", "driveHours", "roadCall", "parts", "extras", "questions"],
};

const SYSTEM = `You turn a mobile diesel mechanic's job notes and parts-receipt photos into invoice data.
Rules:
- Use only what the notes and receipts show. Never invent customers, prices, hours or parts.
- Parts "cost" is what the mechanic paid per item on the receipt (before any markup). Ignore receipt tax lines and totals; list each part.
- Convert minutes to hours (40 min = 0.67).
- If something is missing or unclear, leave it empty or 0 and add a short question to "questions".
- Write "work" in plain, professional language a fleet manager would accept.
- Voice memo transcripts and talk-to-text may mishear words. Fix obvious diesel-repair mishearings from context; if a number, part or customer name is doubtful, ask in "questions" instead of guessing.`;

const MAX_IMAGES = 6;
const MAX_IMAGE_B64 = 3_000_000; // ~2.2 MB per image after the app shrinks it
const OK_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// Diesel words the transcriber should expect (helps it spell shop terms right).
const KEYTERMS = ["DPF", "DEF", "EGR", "SCR", "turbo", "injector", "actuator", "aftertreatment", "regen",
  "air brake", "slack adjuster", "kingpin", "Cummins", "Detroit", "Paccar", "Freightliner", "Peterbilt", "Kenworth", "reefer"];

async function transcribe(url: string, type: string, auth: Record<string, string>): Promise<string> {
  const key = Deno.env.get("DEEPGRAM_API_KEY");
  if (!key) return "";
  try {
    const audio = await fetch(url, { headers: auth });
    if (!audio.ok) return "";
    const bytes = new Uint8Array(await audio.arrayBuffer());
    if (bytes.length > 20_000_000) return "";
    const q = new URLSearchParams({ model: "nova-3", smart_format: "true", punctuate: "true" });
    for (const k of KEYTERMS) q.append("keyterm", k);
    const r = await fetch(`https://api.deepgram.com/v1/listen?${q}`, {
      method: "POST",
      headers: { Authorization: `Token ${key}`, "Content-Type": type || "application/octet-stream" },
      body: bytes,
    });
    if (!r.ok) { console.error("Deepgram error", r.status, (await r.text()).slice(0, 300)); return ""; }
    const out = await r.json();
    return String(out?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? "").trim();
  } catch (e) { console.error("Transcribe failed", e); return ""; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Use POST." }, 405);

  try {
    // 1) Who is calling? Only signed-in users on the allow list.
    const auth = req.headers.get("Authorization") ?? "";
    const supaUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const who = await fetch(`${supaUrl}/auth/v1/user`, { headers: { Authorization: auth, apikey: anon } });
    if (!who.ok) return json({ error: "Please sign in again." }, 401);
    const user = await who.json();
    const allowed = (Deno.env.get("ALLOWED_EMAILS") ?? "")
      .toLowerCase().split(",").map((s) => s.trim()).filter(Boolean);
    if (!allowed.includes(String(user?.email ?? "").toLowerCase())) {
      return json({ error: "This account isn't allowed to use QuickTurn AI." }, 403);
    }

    // 2) Read and check the request.
    const body = await req.json().catch(() => ({}));
    let notes = String(body?.notes ?? "").slice(0, 20000);
    const images = Array.isArray(body?.images) ? body.images.slice(0, MAX_IMAGES) : [];

    // 2b) Optional: draft straight from texts in the Inbox (photos are fetched from Twilio here).
    const ids = Array.isArray(body?.messageIds) ? body.messageIds.slice(0, 30).map(Number).filter(Boolean) : [];
    if (ids.length) {
      const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
      const r = await fetch(`${supaUrl}/rest/v1/inbound_messages?select=id,body,media,received_at&id=in.(${ids.join(",")})&order=received_at.asc`, {
        headers: { apikey: service, Authorization: `Bearer ${service}` },
      });
      const rows = r.ok ? await r.json() : [];
      const sid = Deno.env.get("TWILIO_ACCOUNT_SID") ?? "", tok = Deno.env.get("TWILIO_AUTH_TOKEN") ?? "";
      const texts: string[] = [];
      for (const row of rows) {
        if (row.body) texts.push(row.body);
        for (const m of (row.media ?? [])) {
          const type = String(m.content_type ?? "");
          const twAuth: Record<string, string> = sid && tok ? { Authorization: "Basic " + btoa(`${sid}:${tok}`) } : {};
          if (type.startsWith("audio/") || type === "video/3gpp" || type === "video/mp4") {
            // Voice memo: transcribe with Deepgram, then treat it as notes.
            const said = await transcribe(m.url, type, twAuth);
            texts.push(said ? `[Voice memo transcript]: ${said}` : "[A voice memo couldn't be transcribed. Ask the mechanic to resend it or type the key details.]");
            continue;
          }
          if (!type.startsWith("image/")) { texts.push(`[A ${type || "file"} was attached that can't be read automatically.]`); continue; }
          if (images.length >= MAX_IMAGES) continue;
          try {
            const res = await fetch(m.url, { headers: twAuth });
            if (!res.ok) continue;
            const bytes = new Uint8Array(await res.arrayBuffer());
            if (bytes.length > 3_700_000) { texts.push("[A photo was too large to read; ask for a smaller photo.]"); continue; }
            let bin = ""; for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
            images.push({ media_type: OK_TYPES.includes(type) ? type : "image/jpeg", data: btoa(bin) });
          } catch (_) { /* skip unreadable media */ }
        }
      }
      notes = [texts.join("\n"), notes].filter(Boolean).join("\n").slice(0, 20000);
    }
    if (!notes.trim() && images.length === 0) return json({ error: "Add job notes or a receipt photo." }, 400);

    const content: unknown[] = [];
    for (const img of images) {
      const type = String(img?.media_type ?? "");
      const data = String(img?.data ?? "");
      if (!OK_TYPES.includes(type) || !data || data.length > MAX_IMAGE_B64) continue;
      content.push({ type: "image", source: { type: "base64", media_type: type, data } });
    }
    content.push({ type: "text", text: `Job notes:\n"""\n${notes || "(no notes, use the receipt photos)"}\n"""` });

    // 3) Ask Claude, forcing the structured answer.
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY") || Deno.env.get("Anthropic API Key");
    if (!apiKey) return json({ error: "The AI key isn't set up yet (ANTHROPIC_API_KEY)." }, 500);
    const ai = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: Deno.env.get("ANTHROPIC_MODEL") || "claude-sonnet-5-5",
        max_tokens: 2000,
        system: SYSTEM,
        tools: [{ name: "invoice_draft", description: "Return the invoice data for this job.", input_schema: SCHEMA }],
        tool_choice: { type: "tool", name: "invoice_draft" },
        messages: [{ role: "user", content }],
      }),
    });
    if (!ai.ok) {
      const detail = await ai.text();
      console.error("Anthropic error", ai.status, detail.slice(0, 500));
      return json({ error: `QuickTurn AI couldn't draft this (error ${ai.status}). Try again or fill it in by hand.` }, 502);
    }
    const out = await ai.json();
    const tool = (out?.content ?? []).find((b: { type: string }) => b.type === "tool_use");
    if (!tool?.input) return json({ error: "QuickTurn AI didn't return a draft. Try again." }, 502);
    return json({ draft: tool.input, usage: out?.usage ?? null });
  } catch (e) {
    console.error(e);
    return json({ error: "Something went wrong drafting this invoice." }, 500);
  }
});
