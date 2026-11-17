// QuickTurn: sms-inbound (Supabase Edge Function)
// Twilio calls this when a mechanic texts the QuickTurn number. It saves the text + photos to
// inbound_messages so they show up in the app's Inbox.
//
// IMPORTANT: turn OFF "Verify JWT" for this function (Twilio can't send a Supabase login).
// Security comes from checking Twilio's signature instead.
//
// Secrets (Edge Functions > Secrets):
//   TWILIO_AUTH_TOKEN   from the Twilio console (used to verify requests really come from Twilio)
// Provided automatically: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

// Find a secret even if it was saved with spaces, different capitals, or a small typo.
function secret(...names: string[]): string {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const env = Deno.env.toObject();
  for (const n of names) if (env[n]) return env[n];
  const wanted = names.map(norm);
  for (const [k, v] of Object.entries(env)) if (v && wanted.includes(norm(k))) return v;
  return "";
}

const twiml = (msg?: string) =>
  new Response(
    `<?xml version="1.0" encoding="UTF-8"?><Response>${msg ? `<Message>${msg.replace(/[<&>]/g, "")}</Message>` : ""}</Response>`,
    { headers: { "Content-Type": "text/xml" } },
  );

function normalizePhone(p: string): string {
  const d = (p || "").replace(/\D/g, "");
  if (d.length === 10) return "+1" + d;
  if (d.length === 11 && d.startsWith("1")) return "+" + d;
  return p.startsWith("+") ? "+" + d : d;
}

async function validTwilioSignature(url: string, params: URLSearchParams, signature: string, token: string) {
  const keys = [...new Set([...params.keys()])].sort();
  let data = url;
  for (const k of keys) data += k + (params.get(k) ?? "");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(token), { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data)));
  const expected = btoa(String.fromCharCode(...mac));
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("ok");
  try {
    const supaUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const token = secret("TWILIO_AUTH_TOKEN", "Twilio auth token", "Wtilio auth token");
    const raw = await req.text();
    const params = new URLSearchParams(raw);

    // Twilio signs the exact public URL it called.
    const publicUrl = `${supaUrl}/functions/v1/sms-inbound`;
    const sig = req.headers.get("X-Twilio-Signature") ?? "";
    if (!token || !(await validTwilioSignature(publicUrl, params, sig, token))) {
      console.error("Rejected: bad or missing Twilio signature");
      return new Response("Forbidden", { status: 403 });
    }

    const from = normalizePhone(params.get("From") ?? "");
    const body = (params.get("Body") ?? "").slice(0, 5000);
    const n = Math.min(parseInt(params.get("NumMedia") ?? "0", 10) || 0, 10);
    const media = [];
    for (let i = 0; i < n; i++) {
      const url = params.get(`MediaUrl${i}`);
      if (url) media.push({ url, content_type: params.get(`MediaContentType${i}`) ?? "" });
    }

    const headers = { apikey: service, Authorization: `Bearer ${service}`, "Content-Type": "application/json" };
    // Which mechanic is this?
    const m = await fetch(`${supaUrl}/rest/v1/mechanics?select=id&sms_phone=eq.${encodeURIComponent(from)}&limit=1`, { headers });
    const mech = m.ok ? (await m.json())[0] : null;

    // First text ever from this number? They get the opt-in confirmation promised in our carrier registration.
    const prior = await fetch(`${supaUrl}/rest/v1/inbound_messages?select=id&from_phone=eq.${encodeURIComponent(from)}&limit=1`, { headers });
    const firstText = prior.ok ? (await prior.json()).length === 0 : false;
    const WELCOME = "QuickTurn LLC: Thanks for texting! We'll turn your job notes into invoices. Msg frequency varies. Msg & data rates may apply. Reply HELP for help, STOP to opt out.";

    const ins = await fetch(`${supaUrl}/rest/v1/inbound_messages`, {
      method: "POST",
      headers: { ...headers, Prefer: "resolution=ignore-duplicates" },
      body: JSON.stringify({ from_phone: from, mechanic_id: mech?.id ?? null, body, media, twilio_sid: params.get("MessageSid") }),
    });
    if (!ins.ok) console.error("Insert failed", ins.status, await ins.text());

    const isDone = /^\s*done\s*[.!]*\s*$/i.test(body);
    if (!mech) return twiml(firstText
      ? WELCOME + " We don't recognize this number yet, so reply with your name and business and we'll get you set up."
      : "QuickTurn: We don't recognize this number yet. Reply with your name and business and we'll get you set up.");
    if (firstText) return twiml(WELCOME);
    if (isDone) return twiml("QuickTurn: Got it! We're putting your invoice together and will text it to you to approve. Reply STOP to opt out.");
    return twiml();
  } catch (e) {
    console.error(e);
    return twiml();
  }
});
