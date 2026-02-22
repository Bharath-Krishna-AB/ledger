import { createClient } from '@supabase/supabase-js'
// To run this script locally with env vars:
// node --env-file=.env.local -r ts-node/register test-auth-signup.ts
// Or with tsx:
// npx tsx --env-file=.env.local test-auth-signup.ts

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function testAuth() {
    const uniqueEmail = `test_${Date.now()}@example.com`;
    console.log("Testing signup for email:", uniqueEmail);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: uniqueEmail,
        password: 'Password123!',
    });

    console.log("Signup Error:", signUpError?.message);
    console.log("Signup Session Exists?", !!signUpData?.session);
    console.log("Signup User:", signUpData?.user?.id);

    if (signUpData?.user && !signUpData?.session) {
        console.log("WARN: User created but no session returned. Email Confirmation is likely still REQUIRED in the Supabase Dashboard.");
    }
}

testAuth()
