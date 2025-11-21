import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // Ideally, restrict this to your specific domain in production
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
    // 1. Handle CORS Pre-flight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 2. Initialize Supabase
        // We use the Service Role Key to bypass RLS, ensuring the insert works 
        // regardless of database policies.
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 3. Parse and Validate Data
        // Note: This will fail if the body is not valid JSON
        const { name, phone, team } = await req.json()

        if (!name || !phone || !team) {
            return new Response(
                JSON.stringify({ error: 'MISSING_REQUIRED_FIELDS' }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 400,
                }
            )
        }

        // 4. Perform Insert
        const { data, error } = await supabase
            .from('registrations')
            .insert([
                { name, phone, team },
            ])
            .select()
            .single() // We expect a single response since we inserted one row

        if (error) {
            console.error("Supabase Insert Error:", error)
            throw new Error('DATABASE_WRITE_FAILED')
        }

        // 5. Success Response
        return new Response(
            JSON.stringify({ success: true, data }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            },
        )

    } catch (error) {
        console.error("Function Error:", error.message)
        return new Response(
            JSON.stringify({ error: error.message || 'INTERNAL_SERVER_ERROR' }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400, // or 500 depending on the error
            },
        )
    }
})