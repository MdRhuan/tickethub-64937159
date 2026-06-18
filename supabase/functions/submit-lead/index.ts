// Edge function: submit-lead
// Único caminho de escrita na tabela public.leads.
// - CORS
// - Honeypot (campo "website")
// - Rate-limit por IP (hash com salt) usando public.lead_attempts
// - Validação server-side espelhando as constraints

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/i;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutos
const MAX_ATTEMPTS = 3;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Método não permitido." }, 405);
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const SALT = Deno.env.get("LEAD_IP_HASH_SALT") ?? "";

  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error("[submit-lead] Missing SUPABASE_URL/SERVICE_ROLE_KEY");
    return json({ error: "Configuração do servidor indisponível." }, 500);
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Requisição inválida." }, 400);
  }

  const nome = String(body?.nome ?? "").trim();
  const whatsapp = String(body?.whatsapp ?? "").trim();
  const email = String(body?.email ?? "").trim();
  const nascimento = String(body?.nascimento ?? "").trim();
  const website = String(body?.website ?? "").trim();

  // Honeypot: se preenchido, finge sucesso e não insere nada.
  if (website.length > 0) {
    return json({ ok: true });
  }

  // Validação
  if (nome.length < 1 || nome.length > 120) {
    return json({ error: "Informe um nome válido (até 120 caracteres)." }, 400);
  }
  if (whatsapp.length < 6 || whatsapp.length > 30) {
    return json(
      { error: "Informe um WhatsApp válido (entre 6 e 30 caracteres)." },
      400,
    );
  }
  if (
    email.length < 3 ||
    email.length > 200 ||
    !EMAIL_REGEX.test(email)
  ) {
    return json({ error: "Informe um e-mail válido." }, 400);
  }
  if (nascimento.length > 20) {
    return json({ error: "Data de nascimento inválida." }, 400);
  }

  // IP -> hash
  const xff = req.headers.get("x-forwarded-for") ?? "";
  const ip = xff.split(",")[0]?.trim() || "unknown";
  const ipHash = await sha256Hex(`${SALT}:${ip}`);

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  });

  // Rate-limit: contar tentativas nos últimos WINDOW_MS
  const sinceIso = new Date(Date.now() - WINDOW_MS).toISOString();
  const { count, error: countErr } = await supabase
    .from("lead_attempts")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", sinceIso);

  if (countErr) {
    console.error("[submit-lead] count error", countErr);
    return json({ error: "Não foi possível salvar. Tente novamente." }, 500);
  }

  if ((count ?? 0) >= MAX_ATTEMPTS) {
    return json(
      { error: "Muitas tentativas. Tente novamente em alguns minutos." },
      429,
    );
  }

  // Registra a tentativa antes de prosseguir
  const { error: attemptErr } = await supabase
    .from("lead_attempts")
    .insert({ ip_hash: ipHash });
  if (attemptErr) {
    console.error("[submit-lead] attempt insert error", attemptErr);
    // Não bloqueia — segue para insert do lead
  }

  const id = crypto.randomUUID();
  const { error: insertErr } = await supabase.from("leads").insert({
    id,
    nome,
    whatsapp,
    email,
    nascimento: nascimento || null,
  });

  if (insertErr) {
    console.error("[submit-lead] lead insert error", insertErr);
    return json({ error: "Não foi possível salvar. Tente novamente." }, 500);
  }

  return json({ ok: true });
});
