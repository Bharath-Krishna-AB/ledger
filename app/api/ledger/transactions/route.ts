import { NextRequest, NextResponse } from "next/server";
import { categorizeBillItems } from "@/lib/openai";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { bill, categories } = await req.json();

    if (!bill) {
      return NextResponse.json({ error: "Missing bill" }, { status: 400 });
    }

    const customCategories =
      categories && Array.isArray(categories) && categories.length > 0
        ? categories
        : ["Sales", "Infrastructure", "Marketing", "Software", "Food", "Other"];

    // ── Step 1: Categorize items via OpenAI ───────────────────────────────────
    const rawItems: { n: string; q: number; p: number }[] = bill.items ?? [];

    // Build per-item category map
    let itemCategories: Record<string, string> = {};
    let categoryPrices: Record<string, number> = {};

    if (rawItems.length > 0) {
      categoryPrices = await categorizeBillItems(rawItems, customCategories);
      // Assign a category to each item based on proportional allocation
      // Simple approach: the top category (highest spend) is assigned to each item
      // unless we have enough signal to do per-item. Here we use the top category.
      const topCategory = Object.entries(categoryPrices).sort((a, b) => b[1] - a[1])[0]?.[0]
        ?? customCategories[0];
      rawItems.forEach(it => { itemCategories[it.n] = topCategory; });
    } else {
      const fallback = customCategories[0] ?? "Uncategorized";
      categoryPrices = { [fallback]: bill.total ?? bill.totalAmount ?? 0 };
    }

    const totalAmount = rawItems.length > 0
      ? rawItems.reduce((s, it) => s + it.p * it.q, 0)
      : (bill.total ?? bill.totalAmount ?? 0);

    const primaryCategory = Object.entries(categoryPrices).sort((a, b) => b[1] - a[1])[0]?.[0]
      ?? customCategories[0];

    // ── Step 2: Persist to Supabase ───────────────────────────────────────────
    const supabase = await createClient();

    const { data: txnRow, error: txnErr } = await supabase
      .from("transactions")
      .insert([{
        date: bill.date ?? new Date().toISOString().split("T")[0],
        description: bill.invoice ?? "Scanned Receipt",
        category: primaryCategory,
        type: "Expense",
        amount: totalAmount,
        status: "Completed",
        invoice_ref: bill.invoice ?? null,
        source: "scan",
      }])
      .select()
      .single();

    if (txnErr || !txnRow) {
      console.error("Failed to save transaction:", txnErr);
      return NextResponse.json({ error: "Failed to save transaction" }, { status: 500 });
    }

    // Insert items
    let savedItems: any[] = [];
    if (rawItems.length > 0) {
      const { data: itemRows, error: itemErr } = await supabase
        .from("transaction_items")
        .insert(rawItems.map(it => ({
          txn_id: txnRow.id,
          name: it.n,
          quantity: it.q,
          unit_price: it.p,
          category: itemCategories[it.n] ?? primaryCategory,
        })))
        .select();

      if (itemErr) console.error("Failed to save items:", itemErr);
      if (itemRows) savedItems = itemRows;
    }

    return NextResponse.json({
      ...txnRow,
      items: savedItems,
      category_prices: categoryPrices,
    }, { status: 201 });
  } catch (err) {
    console.error("Error processing transaction", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}