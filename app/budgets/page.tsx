import { BudgetsClient } from "@/components/budgets/BudgetsClient";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function BudgetsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    return (
        <>
            <BudgetsClient />
        </>
    );
}

