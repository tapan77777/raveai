import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

export const businessTypeEnum = pgEnum("business_type", [
  "hotel",
  "restaurant",
  "homestay",
  "dive-center",
  "activity",
]);

export const platformEnum = pgEnum("platform", [
  "google",
  "mmt",
  "tripadvisor",
  "whatsapp",
]);

export const businesses = pgTable("businesses", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: text("owner_id").notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  type: businessTypeEnum("type").notNull(),
  googleMapsUrl: text("google_maps_url"),
  makemytripUrl: text("makemytrip_url"),
  tripadvisorUrl: text("tripadvisor_url"),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  tags: text("tags").array(),
  generatedReview: text("generated_review"),
  platformClicked: platformEnum("platform_clicked"),
  isPrivate: boolean("is_private").default(false).notNull(),
  privateFeedback: text("private_feedback"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Business = typeof businesses.$inferSelect;
export type NewBusiness = typeof businesses.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
