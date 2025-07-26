import { drizzle } from "drizzle-orm/d1";
import { eq, desc } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { familyRelationships, familyMembers } from "~/database/schema";

const app = new Hono<{ Bindings: Env }>();

// Validation schemas
const createRelationshipSchema = z.object({
  person1Id: z.number().int().positive(),
  person2Id: z.number().int().positive(),
  relationshipType: z.enum(["parent", "child", "spouse", "sibling"]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => data.person1Id !== data.person2Id, {
  message: "Cannot create relationship with self",
});

const updateRelationshipSchema = createRelationshipSchema.partial();

// GET /api/relationships - List all relationships
app.get("/", async (c) => {
  try {
    const db = drizzle(c.env.DB);
    const relationships = await db
      .select({
        id: familyRelationships.id,
        person1Id: familyRelationships.person1Id,
        person2Id: familyRelationships.person2Id,
        relationshipType: familyRelationships.relationshipType,
        startDate: familyRelationships.startDate,
        endDate: familyRelationships.endDate,
        notes: familyRelationships.notes,
        createdAt: familyRelationships.createdAt,
        updatedAt: familyRelationships.updatedAt,
      })
      .from(familyRelationships)
      .orderBy(desc(familyRelationships.createdAt));
    
    return c.json({ success: true, data: relationships });
  } catch (error) {
    console.error("Error fetching relationships:", error);
    throw new HTTPException(500, { message: "Failed to fetch relationships" });
  }
});

// GET /api/relationships/:id - Get specific relationship
app.get("/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) {
      throw new HTTPException(400, { message: "Invalid ID format" });
    }

    const db = drizzle(c.env.DB);
    const relationship = await db
      .select()
      .from(familyRelationships)
      .where(eq(familyRelationships.id, id))
      .limit(1);

    if (relationship.length === 0) {
      throw new HTTPException(404, { message: "Relationship not found" });
    }

    return c.json({ success: true, data: relationship[0] });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Error fetching relationship:", error);
    throw new HTTPException(500, { message: "Failed to fetch relationship" });
  }
});

// GET /api/relationships/member/:memberId - Get relationships for a specific member
app.get("/member/:memberId", async (c) => {
  try {
    const memberId = parseInt(c.req.param("memberId"));
    if (isNaN(memberId)) {
      throw new HTTPException(400, { message: "Invalid member ID format" });
    }

    const db = drizzle(c.env.DB);
    const relationships = await db
      .select()
      .from(familyRelationships)
      .where(
        eq(familyRelationships.person1Id, memberId)
      );
    
    return c.json({ success: true, data: relationships });
  } catch (error) {
    console.error("Error fetching member relationships:", error);
    throw new HTTPException(500, { message: "Failed to fetch member relationships" });
  }
});

// POST /api/relationships - Create new relationship
app.post("/", zValidator("json", createRelationshipSchema), async (c) => {
  try {
    const data = c.req.valid("json");
    const now = new Date().toISOString();

    const db = drizzle(c.env.DB);
    
    // Verify both people exist
    const person1 = await db
      .select()
      .from(familyMembers)
      .where(eq(familyMembers.id, data.person1Id))
      .limit(1);
    
    const person2 = await db
      .select()
      .from(familyMembers)
      .where(eq(familyMembers.id, data.person2Id))
      .limit(1);

    if (person1.length === 0) {
      throw new HTTPException(404, { message: "Person 1 not found" });
    }
    
    if (person2.length === 0) {
      throw new HTTPException(404, { message: "Person 2 not found" });
    }

    const result = await db
      .insert(familyRelationships)
      .values({
        ...data,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return c.json({ success: true, data: result[0] }, 201);
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Error creating relationship:", error);
    throw new HTTPException(500, { message: "Failed to create relationship" });
  }
});

// PUT /api/relationships/:id - Update relationship
app.put("/:id", zValidator("json", updateRelationshipSchema), async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) {
      throw new HTTPException(400, { message: "Invalid ID format" });
    }

    const data = c.req.valid("json");
    const now = new Date().toISOString();

    const db = drizzle(c.env.DB);
    
    // Check if relationship exists
    const existing = await db
      .select()
      .from(familyRelationships)
      .where(eq(familyRelationships.id, id))
      .limit(1);

    if (existing.length === 0) {
      throw new HTTPException(404, { message: "Relationship not found" });
    }

    const result = await db
      .update(familyRelationships)
      .set({
        ...data,
        updatedAt: now,
      })
      .where(eq(familyRelationships.id, id))
      .returning();

    return c.json({ success: true, data: result[0] });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Error updating relationship:", error);
    throw new HTTPException(500, { message: "Failed to update relationship" });
  }
});

// DELETE /api/relationships/:id - Delete relationship
app.delete("/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) {
      throw new HTTPException(400, { message: "Invalid ID format" });
    }

    const db = drizzle(c.env.DB);
    
    // Check if relationship exists
    const existing = await db
      .select()
      .from(familyRelationships)
      .where(eq(familyRelationships.id, id))
      .limit(1);

    if (existing.length === 0) {
      throw new HTTPException(404, { message: "Relationship not found" });
    }

    await db
      .delete(familyRelationships)
      .where(eq(familyRelationships.id, id));

    return c.json({ success: true, message: "Relationship deleted successfully" });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Error deleting relationship:", error);
    throw new HTTPException(500, { message: "Failed to delete relationship" });
  }
});

export default app;