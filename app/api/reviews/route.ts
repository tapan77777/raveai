import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { reviews } from "@/lib/schema";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    businessId,
    rating,
    tags,
    generatedReview,
    platformClicked,
    isPrivate,
    privateFeedback,
    reviewPath,
  } = body;

  if (!businessId) {
    return Response.json(
      { error: "businessId is required" },
      { status: 400 }
    );
  }

  const [review] = await db
    .insert(reviews)
    .values({
      businessId,
      rating: rating ?? null,
      tags: tags || [],
      generatedReview: generatedReview || null,
      platformClicked: platformClicked || null,
      isPrivate: isPrivate || false,
      privateFeedback: privateFeedback || null,
      reviewPath: reviewPath || null,
    })
    .returning();

  return Response.json(review, { status: 201 });
}
