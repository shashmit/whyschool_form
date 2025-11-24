import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// CORS headers to allow requests from your frontend
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 1. Create the Supabase Client
        // We use the Service Role key if available to bypass RLS, or Anon key if RLS is set up correctly.
        // Usually, for reading public team data, the Anon key is fine.
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? ''
        )

        // 2. Query the Database
        // We select the Team Name and join the 'members' table to get their details.
        const { data: teams, error } = await supabase
            .from('teams')
            .select(`
        name,
        members (
          id,
          name,
          assigned_role,
          roll_number
        )
      `)
            .order('created_at', { ascending: true })

        if (error) {
            throw error
        }

        // 3. Format the Data
        // The user requested a specific format where Team Name is the heading.
        const formattedData = teams.map((t) => ({
            team: t.name,
            members: t.members.map((m: any) => ({
                id: m.id,
                name: m.name,
                role: m.assigned_role,
                roll_number: m.roll_number
            }))
        }))

        // 4. Return the Response
        return new Response(JSON.stringify(formattedData), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})