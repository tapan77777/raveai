CREATE TYPE "public"."business_type" AS ENUM('hotel', 'restaurant', 'homestay', 'dive-center', 'activity');--> statement-breakpoint
CREATE TYPE "public"."platform" AS ENUM('google', 'mmt', 'tripadvisor', 'whatsapp');--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"type" "business_type" NOT NULL,
	"google_maps_url" text,
	"makemytrip_url" text,
	"tripadvisor_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "businesses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"tags" text[],
	"generated_review" text,
	"platform_clicked" "platform",
	"is_private" boolean DEFAULT false NOT NULL,
	"private_feedback" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;