import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const body = await req.json()
        const {
            name, mobile, email, gender,
            course, year_semester, roll_number,
            team_role, has_experience, experience_topic
        } = body

        // Basic validation
        if (!name || !mobile || !email || !gender || !course || !year_semester || !roll_number || !team_role) {
            return new Response(
                JSON.stringify({ error: 'MISSING_REQUIRED_FIELDS' }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 400,
                }
            )
        }

        // Validate team_role is an array and has correct length
        if (!Array.isArray(team_role) || team_role.length === 0 || team_role.length > 2) {
            return new Response(
                JSON.stringify({ error: 'INVALID_TEAM_ROLE_SELECTION' }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 400,
                }
            )
        }

        const { data, error } = await supabase
            .from('bootcamp_enrollments')
            .insert([
                {
                    name, mobile, email, gender,
                    course, year_semester, roll_number,
                    team_role, has_experience, experience_topic
                },
            ])
            .select()
            .single()

        if (error) {
            console.error("Supabase Insert Error:", error)
            throw new Error('DATABASE_WRITE_FAILED')
        }

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
                status: 400,
            },
        )
    }
})
