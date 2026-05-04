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
  } = body;

  if (!businessId || !rating) {
    return Response.json(
      { error: "businessId and rating are required" },
      { status: 400 }
    );
  }

  const [review] = await db
    .insert(reviews)
    .values({
      businessId,
      rating,
      tags: tags || [],
      generatedReview: generatedReview || null,
      platformClicked: platformClicked || null,
      isPrivate: isPrivate || false,
      privateFeedback: privateFeedback || null,
    })
    .returning();

  return Response.json(review, { status: 201 });
}
