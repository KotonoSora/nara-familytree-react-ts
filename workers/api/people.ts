import { drizzle } from "drizzle-orm/d1";
import { eq, desc } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

import * as schema from "~/database/schema";

const app = new Hono<{ Bindings: Env }>();

// Validation schemas
const personSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  middleName: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  birthDate: z.string().optional(),
  deathDate: z.string().optional(),
  birthPlace: z.string().optional(),
  bio: z.string().optional(),
  profileImage: z.string().optional(),
});

const updatePersonSchema = personSchema.partial();

// Get all people
app.get("/", async (c) => {
  const db = drizzle(c.env.DB, { schema });
  
  try {
    const people = await db
      .select()
      .from(schema.people)
      .orderBy(desc(schema.people.createdAt));
    
    return c.json({ data: people });
  } catch (error) {
    console.error("Error fetching people:", error);
    throw new HTTPException(500, { message: "Failed to fetch people" });
  }
});

// Get person by ID
app.get("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) {
    throw new HTTPException(400, { message: "Invalid person ID" });
  }

  const db = drizzle(c.env.DB, { schema });
  
  try {
    const person = await db
      .select()
      .from(schema.people)
      .where(eq(schema.people.id, id))
      .limit(1);
    
    if (person.length === 0) {
      throw new HTTPException(404, { message: "Person not found" });
    }
    
    return c.json({ data: person[0] });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Error fetching person:", error);
    throw new HTTPException(500, { message: "Failed to fetch person" });
  }
});

// Create new person
app.post("/", async (c) => {
  const body = await c.req.json();
  const validation = personSchema.safeParse(body);
  
  if (!validation.success) {
    throw new HTTPException(400, { 
      message: "Invalid data", 
      cause: validation.error.issues 
    });
  }

  const data = validation.data;
  const db = drizzle(c.env.DB, { schema });
  
  try {
    const result = await db
      .insert(schema.people)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    
    return c.json({ data: result[0] }, 201);
  } catch (error) {
    console.error("Error creating person:", error);
    throw new HTTPException(500, { message: "Failed to create person" });
  }
});

// Update person
app.put("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) {
    throw new HTTPException(400, { message: "Invalid person ID" });
  }

  const body = await c.req.json();
  const validation = updatePersonSchema.safeParse(body);
  
  if (!validation.success) {
    throw new HTTPException(400, { 
      message: "Invalid data", 
      cause: validation.error.issues 
    });
  }

  const data = validation.data;
  const db = drizzle(c.env.DB, { schema });
  
  try {
    const result = await db
      .update(schema.people)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(schema.people.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new HTTPException(404, { message: "Person not found" });
    }
    
    return c.json({ data: result[0] });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Error updating person:", error);
    throw new HTTPException(500, { message: "Failed to update person" });
  }
});

// Delete person
app.delete("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) {
    throw new HTTPException(400, { message: "Invalid person ID" });
  }

  const db = drizzle(c.env.DB, { schema });
  
  try {
    const result = await db
      .delete(schema.people)
      .where(eq(schema.people.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new HTTPException(404, { message: "Person not found" });
    }
    
    return c.json({ message: "Person deleted successfully" });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Error deleting person:", error);
    throw new HTTPException(500, { message: "Failed to delete person" });
  }
});

export default app;