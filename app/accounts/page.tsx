import { AccountsClient } from "@/components/accounts/AccountsClient";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function AccountsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    return (
        <>
            <AccountsClient />
        </>
    );
}

