import { relations, sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const people = sqliteTable("people", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  // Basic information
  firstName: text("first_name").notNull(),
  lastName: text("last_name"),
  middleName: text("middle_name"),
  nickname: text("nickname"),

  // Life details
  birthDate: text("birth_date"), // ISO date string or partial date like "1980" or "1980-05"
  birthPlace: text("birth_place"),
  deathDate: text("death_date"),
  deathPlace: text("death_place"),

  // Physical details
  gender: text("gender", { enum: ["male", "female", "other", "unknown"] }),

  // Visual representation
  photo: text("photo"), // URL or base64
  notes: text("notes"),

  // Canvas positioning for visual editor
  canvasX: real("canvas_x").default(0),
  canvasY: real("canvas_y").default(0),
  canvasWidth: real("canvas_width").default(150),
  canvasHeight: real("canvas_height").default(100),
  canvasColor: text("canvas_color").default("#ffffff"),

  // Metadata
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
});

export const relationships = sqliteTable("relationships", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  // The two people in the relationship
  person1Id: integer("person1_id")
    .notNull()
    .references(() => people.id, { onDelete: "cascade" }),
  person2Id: integer("person2_id")
    .notNull()
    .references(() => people.id, { onDelete: "cascade" }),

  // Type of relationship
  relationshipType: text("relationship_type", {
    enum: [
      "parent-child", // person1 is parent of person2
      "spouse", // married or long-term partners
      "sibling", // brothers/sisters
      "divorced", // former spouses
      "partner", // unmarried romantic partners
      "step-parent", // step relationships
      "step-child",
      "step-sibling",
      "adopted-parent", // adoption relationships
      "adopted-child",
      "guardian", // legal guardianship
      "ward",
      "other", // custom relationships
    ],
  }).notNull(),

  // Additional relationship details
  startDate: text("start_date"), // When relationship began (marriage, adoption, etc.)
  endDate: text("end_date"), // When relationship ended (divorce, death, etc.)
  notes: text("notes"),

  // Canvas visual connection
  connectionStyle: text("connection_style", {
    enum: ["straight", "curved", "stepped"],
  }).default("curved"),
  connectionColor: text("connection_color").default("#333333"),
  connectionWidth: real("connection_width").default(2),

  // Metadata
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
});

export const familyTrees = sqliteTable("family_trees", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  // Tree metadata
  name: text("name").notNull(),
  description: text("description"),

  // Canvas settings
  canvasWidth: real("canvas_width").default(2000),
  canvasHeight: real("canvas_height").default(1500),
  canvasBackgroundColor: text("canvas_background_color").default("#f8f9fa"),
  canvasBackgroundImage: text("canvas_background_image"), // URL for background image

  // View settings
  defaultZoom: real("default_zoom").default(1.0),
  defaultCenterX: real("default_center_x").default(1000),
  defaultCenterY: real("default_center_y").default(750),

  // Access control
  isPublic: integer("is_public", { mode: "boolean" }).default(false),

  // Metadata
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
});

export const treeMembers = sqliteTable("tree_members", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  treeId: integer("tree_id")
    .notNull()
    .references(() => familyTrees.id, { onDelete: "cascade" }),
  personId: integer("person_id")
    .notNull()
    .references(() => people.id, { onDelete: "cascade" }),

  // Position specific to this tree (people can be in multiple trees)
  treeCanvasX: real("tree_canvas_x"),
  treeCanvasY: real("tree_canvas_y"),
  treeCanvasWidth: real("tree_canvas_width"),
  treeCanvasHeight: real("tree_canvas_height"),
  treeCanvasColor: text("tree_canvas_color"),

  // Role in this specific tree
  isRootPerson: integer("is_root_person", { mode: "boolean" }).default(false),

  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
});

// Relations
export const peopleRelations = relations(people, ({ many }) => ({
  relationshipsAsPerson1: many(relationships, { relationName: "person1" }),
  relationshipsAsPerson2: many(relationships, { relationName: "person2" }),
  treeMemberships: many(treeMembers),
}));

export const relationshipsRelations = relations(relationships, ({ one }) => ({
  person1: one(people, {
    fields: [relationships.person1Id],
    references: [people.id],
    relationName: "person1",
  }),
  person2: one(people, {
    fields: [relationships.person2Id],
    references: [people.id],
    relationName: "person2",
  }),
}));

export const familyTreesRelations = relations(familyTrees, ({ many }) => ({
  members: many(treeMembers),
}));

export const treeMembersRelations = relations(treeMembers, ({ one }) => ({
  tree: one(familyTrees, {
    fields: [treeMembers.treeId],
    references: [familyTrees.id],
  }),
  person: one(people, {
    fields: [treeMembers.personId],
    references: [people.id],
  }),
}));
