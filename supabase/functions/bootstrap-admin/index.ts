// One-shot edge function to create the initial admin account.
// Safe to call repeatedly: idempotent for the seeded admin email.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ADMIN_EMAIL = 'rhuanmatavellii@gmail.com'
const ADMIN_PASSWORD = 'Rhuan@TicketHub13'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Check if user already exists
    const { data: list } = await supabase.auth.admin.listUsers()
    let userId = list?.users.find(u => u.email === ADMIN_EMAIL)?.id

    if (!userId) {
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
      })
      if (createErr) throw createErr
      userId = created.user!.id
    }

    // Ensure admin role
    const { error: roleErr } = await supabase
      .from('user_roles')
      .upsert({ user_id: userId, role: 'admin' }, { onConflict: 'user_id,role' })
    if (roleErr) throw roleErr

    return new Response(
      JSON.stringify({ ok: true, user_id: userId, email: ADMIN_EMAIL }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: String(e?.message ?? e) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
