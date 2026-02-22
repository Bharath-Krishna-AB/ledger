import OpenAI from 'openai';

/**
 * Sends a list of bill items and the user's custom categories to the LLM.
 * Returns a mapping of category names to total spent in that category.
 */
export async function categorizeBillItems(
  items: { n: string; q: number; p: number }[],
  categories: string[]
): Promise<Record<string, number>> {
  if (!items || items.length === 0 || !categories || categories.length === 0) {
    return { "Uncategorized": items.reduce((sum, item) => sum + item.p * item.q, 0) };
  }

  const prompt = `
    You are an expert financial categorizer.

    Given the following items from a bill:
    ${JSON.stringify(items.map(it => ({ name: it.n, price: it.p * it.q })), null, 2)}

    And the following custom categories defined by the user:
    ${JSON.stringify(categories, null, 2)}

    Categorize each item into exactly ONE of the provided custom categories.
    Calculate the total price for each category.

    Return a valid JSON object where the keys are the category names (MUST be exactly as provided in the list) and the values are the total price for that category (as a number).

    Example output format:
    {
      "Groceries": 45.50,
      "Utilities": 100.00
    }

    IMPORTANT: Respond ONLY with the JSON object. Do not include markdown formatting or any other text.
  `;

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Or gpt-3.5-turbo depending on your model preference
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1, // Low temperature for deterministic classification
      response_format: { type: "json_object" }
    });

    const result = completion.choices[0].message.content;
    if (result) {
      return JSON.parse(result) as Record<string, number>;
    }
    throw new Error("Empty response from LLM");
  } catch (error) {
    console.error("Failed to categorize bill items:", error);
    // Fallback: Dump everything into uncategorized or the first category
    const fallbackCategory = categories.length > 0 ? categories[0] : "Uncategorized";
    const total = items.reduce((acc, current) => acc + current.p * current.q, 0);
    return { [fallbackCategory]: total };
  }
}
