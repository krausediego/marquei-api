import { randomUUIDv7 } from "bun";
import { relations } from "drizzle-orm";
import { geometry, integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { invitations } from "./invitations";
import { members } from "./members";

export const organizations = pgTable(
  "organizations",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => randomUUIDv7()),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description").notNull(),
    phone: text("phone").notNull().unique(),
    state: text("state").notNull(),
    city: text("city").notNull(),
    district: text("district").notNull(),
    street: text("street").notNull(),
    number: integer("number").notNull(),
    location: geometry("location", { type: "point", mode: "xy", srid: 4326 }).notNull(),
    complement: text("complement"),
    postalCode: text("postal_code"),
    logo: text("logo"),
    createdAt: timestamp("created_at").notNull(),
    metadata: text("metadata"),
    stripeCustomerId: text("stripe_customer_id"),
  },
  (table) => [uniqueIndex("organizations_slug_uidx").on(table.slug)],
);

export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(members),
  invitations: many(invitations),
}));
