import { createClient } from '@supabase/supabase-js';
// To run this script locally with env vars:
// node --env-file=.env.local test-auth-signup.mjs

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testAuth() {
    const uniqueEmail = `test_${Date.now()}@example.com`;
    console.log("Testing signup for:", uniqueEmail);
    
    const { data, error } = await supabase.auth.signUp({
        email: uniqueEmail,
        password: 'Password123!',
    });
    
    console.log("Signup Error:", error?.message);
    console.log("Signup Session Exists?", !!data?.session);

    if (data?.user && !data?.session) {
        console.log("RESULT_CONFIRM_REQUIRED");
    } else if (data?.session) {
        console.log("RESULT_SUCCESS");
    }
}

testAuth();
