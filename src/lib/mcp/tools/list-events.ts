import { defineTool } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export default defineTool({
  name: "list_events",
  title: "List events",
  description: "List upcoming/available events (ingressos) from TicketHub BH. Optionally filter by music genre/category or a text query matching title or venue.",
  inputSchema: {
    category: z.string().optional().describe("Genre/category filter (e.g. FUNK, SERTANEJO, PAGODE, ROCK, POP)."),
    query: z.string().optional().describe("Case-insensitive substring to match against event title or venue."),
    limit: z.number().int().positive().max(100).optional().describe("Max number of results (default 50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ category, query, limit }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    let q = supabase.from("eventos").select("id,titulo,sobre,data,hora,local,categoria,preco,imgUrl").order("_ts", { ascending: true });
    if (category) q = q.eq("categoria", category);
    const { data, error } = await q.limit(limit ?? 50);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const filtered = query
      ? (data ?? []).filter((e: any) => {
          const s = query.toLowerCase();
          return e.titulo?.toLowerCase().includes(s) || e.local?.toLowerCase().includes(s);
        })
      : (data ?? []);
    return {
      content: [{ type: "text", text: JSON.stringify(filtered) }],
      structuredContent: { events: filtered },
    };
  },
});
