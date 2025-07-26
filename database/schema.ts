import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const demo = sqliteTable("demo", {
  id: integer("id").primaryKey({ autoIncrement: true }),
});

export const familyMembers = sqliteTable("family_members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  middleName: text("middle_name"),
  maidenName: text("maiden_name"),
  birthDate: text("birth_date"), // ISO date string
  deathDate: text("death_date"), // ISO date string, null if still alive
  gender: text("gender", { enum: ["male", "female", "other"] }).notNull(),
  birthPlace: text("birth_place"),
  deathPlace: text("death_place"),
  occupation: text("occupation"),
  biography: text("biography"),
  photoUrl: text("photo_url"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const familyRelationships = sqliteTable("family_relationships", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  person1Id: integer("person1_id").notNull().references(() => familyMembers.id, { onDelete: "cascade" }),
  person2Id: integer("person2_id").notNull().references(() => familyMembers.id, { onDelete: "cascade" }),
  relationshipType: text("relationship_type", { 
    enum: ["parent", "child", "spouse", "sibling"] 
  }).notNull(),
  startDate: text("start_date"), // For marriages, partnerships
  endDate: text("end_date"), // For divorces, separations
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
