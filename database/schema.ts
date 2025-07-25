import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const people = sqliteTable("people", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  middleName: text("middle_name"),
  gender: text("gender", { enum: ["male", "female", "other"] }),
  birthDate: text("birth_date"), // ISO date string
  deathDate: text("death_date"), // ISO date string
  birthPlace: text("birth_place"),
  bio: text("bio"),
  profileImage: text("profile_image"), // URL or base64
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const relationships = sqliteTable("relationships", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  parentId: integer("parent_id").notNull().references(() => people.id, { onDelete: "cascade" }),
  childId: integer("child_id").notNull().references(() => people.id, { onDelete: "cascade" }),
  relationshipType: text("relationship_type", { enum: ["biological", "adopted", "step", "foster"] }).default("biological"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Relations
export const peopleRelations = relations(people, ({ many }) => ({
  children: many(relationships, { relationName: "parent" }),
  parents: many(relationships, { relationName: "child" }),
}));

export const relationshipsRelations = relations(relationships, ({ one }) => ({
  parent: one(people, {
    fields: [relationships.parentId],
    references: [people.id],
    relationName: "parent",
  }),
  child: one(people, {
    fields: [relationships.childId],
    references: [people.id],
    relationName: "child",
  }),
}));

// Keep demo table for backward compatibility
export const demo = sqliteTable("demo", {
  id: integer("id").primaryKey({ autoIncrement: true }),
});
