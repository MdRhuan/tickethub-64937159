import { defineTool } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export default defineTool({
  name: "list_blog_posts",
  title: "List blog posts",
  description: "List blog posts published on TicketHub BH. Returns metadata only; use get_blog_post for the full body.",
  inputSchema: {
    tag: z.string().optional().describe("Filter posts by tag."),
    limit: z.number().int().positive().max(100).optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ tag, limit }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    let q = supabase.from("posts").select("id,titulo,subtitulo,tag,autor,data,imgUrl,destaque").order("_ts", { ascending: false });
    if (tag) q = q.eq("tag", tag);
    const { data, error } = await q.limit(limit ?? 50);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { posts: data ?? [] },
    };
  },
});
