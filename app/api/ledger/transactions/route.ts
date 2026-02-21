import { NextRequest, NextResponse } from "next/server";
import { categorizeBillItems } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { bill, categories } = await req.json();

    if (!bill) {
      return NextResponse.json({ error: "Missing bill" }, { status: 400 });
    }

    // Default to a basic array if the user doesn't provide any.
    const customCategories = categories && Array.isArray(categories) && categories.length > 0
      ? categories
      : ["Sales", "Infrastructure", "Marketing", "Software", "Food", "Other"];

    let categoryPrices: Record<string, number> = {};
    if (bill.items && Array.isArray(bill.items)) {
      categoryPrices = await categorizeBillItems(bill.items, customCategories);
    } else {
      // If no items list exists on the bill, just put the total amount into Uncategorized.
      const fallback = customCategories.length > 0 ? customCategories[0] : "Uncategorized";
      categoryPrices = { [fallback]: bill.totalAmount || 0 };
    }

    // Append the categorized prices back onto the bill tracking object before responding
    const finalBill = {
       ...bill,
       category_prices: categoryPrices
    }

    return NextResponse.json(finalBill, { status: 201 });
  } catch (err) {
    console.error("Error processing transaction", err)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}