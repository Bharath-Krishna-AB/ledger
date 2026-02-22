import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MIME_TO_EXT: Record<string, string> = {
  "audio/webm": "webm",
  "audio/ogg": "ogg",
  "audio/mp4": "mp4",
  "audio/x-m4a": "m4a",
  "audio/wav": "wav",
  "audio/mpeg": "mp3",
  "audio/aac": "aac",
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;
    const categoriesRaw = formData.get("categories") as string | null;
    const mimeType = formData.get("mimeType") as string | null;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const categories: string[] = categoriesRaw
      ? JSON.parse(categoriesRaw)
      : ["Sales", "Infrastructure", "Marketing", "Software", "Services", "Food", "Other"];

    // ── Step 1: Transcribe ────────────────────────────────────────────────────
    const detectedMime = mimeType || audioFile.type || "audio/webm";
    const baseMime = detectedMime.split(";")[0].trim();
    const ext = MIME_TO_EXT[baseMime] ?? "webm";
    const namedFile = new File([audioFile], `voice.${ext}`, { type: baseMime });

    console.log(`[voice-tx] Whisper: type=${baseMime} ext=${ext} size=${namedFile.size}B`);
    const transcription = await openai.audio.transcriptions.create({
      file: namedFile,
      model: "whisper-1",
      language: "en",
    });

    const transcript = (transcription.text ?? "").trim();
    console.log(`[voice-tx] Transcript: "${transcript}"`);

    if (!transcript) {
      return NextResponse.json(
        { error: "Didn't catch that — please speak clearly and try again." },
        { status: 422 }
      );
    }

    // ── Step 2: Parse into item-level transaction ─────────────────────────────
    const systemPrompt = `You are a financial assistant that extracts transaction details from natural speech.

Available categories: ${JSON.stringify(categories)}

Extract the following and respond with ONLY valid JSON, no markdown:
{
  "description": "short title for the overall transaction",
  "type": "Income" or "Expense",
  "items": [
    { "name": "item name", "quantity": 1, "unit_price": 100, "category": "one of the available categories" }
  ]
}

Rules:
- "spent", "paid", "bought", "costs" → Expense; "received", "earned", "got paid", "sale", "salary" → Income
- If multiple items are mentioned, list each separately with its price
- If only a total is mentioned (e.g. "spent 450 on food"), create ONE item with that total as unit_price and quantity 1
- Always estimate unit_price as a positive number
- Always pick category from the available list`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Parse this voice input: "${transcript}"` },
      ],
    });

    const parsed = JSON.parse(completion.choices[0].message.content ?? "{}");
    const items: { name: string; quantity: number; unit_price: number; category: string }[] =
      Array.isArray(parsed.items) && parsed.items.length > 0
        ? parsed.items
        : [{ name: parsed.description ?? "Transaction", quantity: 1, unit_price: 0, category: categories[0] }];

    const totalAmount = items.reduce((s, it) => s + it.unit_price * it.quantity, 0);

    return NextResponse.json({
      transcript,
      description: parsed.description ?? items[0]?.name ?? "",
      amount: totalAmount,
      type: (parsed.type === "Income" ? "Income" : "Expense") as "Income" | "Expense",
      category: items[0]?.category ?? categories[0],
      items,
    });
  } catch (err: any) {
    console.error("Voice transaction error:", err?.message ?? err);
    return NextResponse.json({ error: "Failed to process voice input" }, { status: 500 });
  }
}
