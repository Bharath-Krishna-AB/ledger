import { LedgerClient } from "@/components/LedgerClient";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function LedgerPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    return <LedgerClient />;
}

