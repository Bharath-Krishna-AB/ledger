import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;
    const categoriesRaw = formData.get("categories") as string | null;

    if (!imageFile) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    const categories: string[] = categoriesRaw
      ? JSON.parse(categoriesRaw)
      : ["Sales", "Infrastructure", "Marketing", "Software", "Services", "Food", "Other"];

    // Buffer the file
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create data URI for OpenAI Vision
    const mimeType = imageFile.type || 'image/jpeg';
    const base64Image = buffer.toString('base64');
    const dataUri = `data:${mimeType};base64,${base64Image}`;

    const systemPrompt = `You are a financial assistant that extracts transaction details from receipt images.

Available categories: ${JSON.stringify(categories)}

Analyze the provided receipt/invoice image. Extract the following and respond with ONLY valid JSON, no markdown:
{
  "description": "Store name or very short summary of the purchase",
  "type": "Income" or "Expense",
  "items": [
    { "name": "item name", "quantity": 1, "unit_price": 100, "category": "one of the available categories" }
  ]
}

Rules:
- Receipts are usually "Expense". Only use "Income" if it's explicitly an invoice or payment received payload.
- If multiple items are listed, extract each one with its price and quantity.
- Ignore tax/tip lines from items array; include them only if they represent the entire transaction or just put the grand total as a single item if itemization fails.
- Always pick the most appropriate category from the available list for each item.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: "Parse this receipt image:" },
            { type: "image_url", image_url: { url: dataUri } }
          ]
        },
      ],
    });

    const parsed = JSON.parse(completion.choices[0].message.content ?? "{}");
    const items: { name: string; quantity: number; unit_price: number; category: string }[] =
      Array.isArray(parsed.items) && parsed.items.length > 0
        ? parsed.items
        : [{ name: parsed.description ?? "Transaction", quantity: 1, unit_price: 0, category: categories[0] }];

    const totalAmount = items.reduce((s, it) => s + it.unit_price * it.quantity, 0);

    return NextResponse.json({
      description: parsed.description ?? items[0]?.name ?? "Receipt Scan",
      amount: totalAmount,
      type: (parsed.type === "Income" ? "Income" : "Expense") as "Income" | "Expense",
      category: items[0]?.category ?? categories[0],
      items,
    });
  } catch (err: any) {
    console.error("Receipt transaction error:", err?.message ?? err);
    return NextResponse.json({ error: "Failed to process receipt image" }, { status: 500 });
  }
}
