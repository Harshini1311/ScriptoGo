
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
    console.log("--- Supabase Schema Diagnostics ---");
    console.log(`Target URL: ${supabaseUrl}`);

    // 1. Check if we can reach the API
    const { data, error } = await supabase.from('scripts').select('*').limit(1);

    if (error) {
        if (error.message.includes("schema cache") || error.message.includes("column")) {
            console.error("❌ SCHEMA CACHE ERROR DETECTED");
            console.error(`Message: ${error.message}`);
            console.error(`Code: ${error.code}`);
        } else {
            console.error("❌ UNKNOWN ERROR");
            console.error(error);
        }
    } else {
        console.log("✅ API Connection successful.");
    }

    // 2. Try to fetch the list of columns via RPC or direct query if possible
    // Since we can't easily run raw SQL via the client without an RPC, we'll try a minimal select
    const { error: colError } = await supabase.from('scripts').select('id, user_id, platform, topic, content').limit(0);
    if (colError) {
        console.error("❌ Basic columns check failed:", colError.message);
    } else {
        console.log("✅ Basic columns (id, user_id, platform, topic, content) are visible.");
    }
}

diagnose();
