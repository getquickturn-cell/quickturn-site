// QuickTurn: draft-invoice (Supabase Edge Function)
// Turns a mechanic's job notes + receipt photos into structured invoice data with Claude.
//
// Secrets to set in Supabase (Edge Functions > Secrets):
//   ANTHROPIC_API_KEY   your Anthropic API key (never put this in the website code)
//   ALLOWED_EMAILS      comma-separated emails allowed to use it, e.g. getquickturn@gmail.com,danny@example.com
//   ANTHROPIC_MODEL     optional; defaults to claude-sonnet-5-5
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
- Write "work" in plain, professional language a fleet manager would accept.`;

const MAX_IMAGES = 6;
const MAX_IMAGE_B64 = 3_000_000; // ~2.2 MB per image after the app shrinks it
const OK_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

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
    const notes = String(body?.notes ?? "").slice(0, 20000);
    const images = Array.isArray(body?.images) ? body.images.slice(0, MAX_IMAGES) : [];
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
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
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
