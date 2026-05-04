import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { businessName, businessType, rating, tags } = body;

  if (!businessName || !rating) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content: `Generate a genuine, natural sounding ${rating} star review for ${businessName} which is a ${businessType}. Customer felt: ${tags?.join(", ") || "good experience"}. Make it sound human, warm, 2-3 sentences. No hashtags. No emojis in review text. Just the review text, nothing else.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error("Anthropic API error:", response.status, err);
      return Response.json({ error: "Failed to generate review" }, { status: 500 });
    }

    const data = await response.json();
    const reviewText = data.content[0].text;

    return Response.json({ review: reviewText });
  } catch (error) {
    console.error("Generate review error:", error);
    return Response.json({ error: "Failed to generate review" }, { status: 500 });
  }
}
