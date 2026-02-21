import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

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
