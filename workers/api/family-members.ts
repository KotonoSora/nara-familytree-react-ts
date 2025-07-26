import { drizzle } from "drizzle-orm/d1";
import { eq, desc } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { familyMembers } from "~/database/schema";

const app = new Hono<{ Bindings: Env }>();

// Validation schemas
const createFamilyMemberSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  middleName: z.string().optional(),
  maidenName: z.string().optional(),
  birthDate: z.string().optional(),
  deathDate: z.string().optional(),
  gender: z.enum(["male", "female", "other"]),
  birthPlace: z.string().optional(),
  deathPlace: z.string().optional(),
  occupation: z.string().optional(),
  biography: z.string().optional(),
  photoUrl: z.string().url().optional(),
});

const updateFamilyMemberSchema = createFamilyMemberSchema.partial();

// GET /api/family-members - List all family members
app.get("/", async (c) => {
  try {
    const db = drizzle(c.env.DB);
    const members = await db
      .select()
      .from(familyMembers)
      .orderBy(desc(familyMembers.createdAt));
    
    return c.json({ success: true, data: members });
  } catch (error) {
    console.error("Error fetching family members:", error);
    throw new HTTPException(500, { message: "Failed to fetch family members" });
  }
});

// GET /api/family-members/:id - Get specific family member
app.get("/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) {
      throw new HTTPException(400, { message: "Invalid ID format" });
    }

    const db = drizzle(c.env.DB);
    const member = await db
      .select()
      .from(familyMembers)
      .where(eq(familyMembers.id, id))
      .limit(1);

    if (member.length === 0) {
      throw new HTTPException(404, { message: "Family member not found" });
    }

    return c.json({ success: true, data: member[0] });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Error fetching family member:", error);
    throw new HTTPException(500, { message: "Failed to fetch family member" });
  }
});

// POST /api/family-members - Create new family member
app.post("/", zValidator("json", createFamilyMemberSchema), async (c) => {
  try {
    const data = c.req.valid("json");
    const now = new Date().toISOString();

    const db = drizzle(c.env.DB);
    const result = await db
      .insert(familyMembers)
      .values({
        ...data,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return c.json({ success: true, data: result[0] }, 201);
  } catch (error) {
    console.error("Error creating family member:", error);
    throw new HTTPException(500, { message: "Failed to create family member" });
  }
});

// PUT /api/family-members/:id - Update family member
app.put("/:id", zValidator("json", updateFamilyMemberSchema), async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) {
      throw new HTTPException(400, { message: "Invalid ID format" });
    }

    const data = c.req.valid("json");
    const now = new Date().toISOString();

    const db = drizzle(c.env.DB);
    
    // Check if member exists
    const existing = await db
      .select()
      .from(familyMembers)
      .where(eq(familyMembers.id, id))
      .limit(1);

    if (existing.length === 0) {
      throw new HTTPException(404, { message: "Family member not found" });
    }

    const result = await db
      .update(familyMembers)
      .set({
        ...data,
        updatedAt: now,
      })
      .where(eq(familyMembers.id, id))
      .returning();

    return c.json({ success: true, data: result[0] });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Error updating family member:", error);
    throw new HTTPException(500, { message: "Failed to update family member" });
  }
});

// DELETE /api/family-members/:id - Delete family member
app.delete("/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) {
      throw new HTTPException(400, { message: "Invalid ID format" });
    }

    const db = drizzle(c.env.DB);
    
    // Check if member exists
    const existing = await db
      .select()
      .from(familyMembers)
      .where(eq(familyMembers.id, id))
      .limit(1);

    if (existing.length === 0) {
      throw new HTTPException(404, { message: "Family member not found" });
    }

    await db
      .delete(familyMembers)
      .where(eq(familyMembers.id, id));

    return c.json({ success: true, message: "Family member deleted successfully" });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Error deleting family member:", error);
    throw new HTTPException(500, { message: "Failed to delete family member" });
  }
});

export default app;