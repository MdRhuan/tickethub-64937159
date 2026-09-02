import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

Deno.serve(async (req) => {
  try {
    const { email, password, secret } = await req.json();
    if (secret !== "one-time-setup-2026") {
      return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
    }
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let userId: string | null = null;
    const { data: created, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) {
      const { data: list } = await admin.auth.admin.listUsers();
      userId = list.users.find((u) => u.email?.toLowerCase() === String(email).toLowerCase())?.id ?? null;
      if (!userId) throw error;
      await admin.auth.admin.updateUserById(userId, { password, email_confirm: true });
    } else {
      userId = created.user!.id;
    }

    const { error: roleErr } = await admin
      .from("user_roles")
      .upsert({ user_id: userId, role: "editor" }, { onConflict: "user_id,role" });
    if (roleErr) throw roleErr;

    return new Response(JSON.stringify({ ok: true, userId }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});
