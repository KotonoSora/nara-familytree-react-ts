import { drizzle } from "drizzle-orm/d1";
import { eq, or, and } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

import * as schema from "~/database/schema";

const app = new Hono<{ Bindings: Env }>();

// Validation schemas
const relationshipSchema = z.object({
  parentId: z.number().int().positive(),
  childId: z.number().int().positive(),
  relationshipType: z.enum(["biological", "adopted", "step", "foster"]).default("biological"),
});

// Get all relationships for a person
app.get("/person/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) {
    throw new HTTPException(400, { message: "Invalid person ID" });
  }

  const db = drizzle(c.env.DB, { schema });
  
  try {
    const relationships = await db
      .select({
        id: schema.relationships.id,
        parentId: schema.relationships.parentId,
        childId: schema.relationships.childId,
        relationshipType: schema.relationships.relationshipType,
        parent: {
          id: schema.people.id,
          firstName: schema.people.firstName,
          lastName: schema.people.lastName,
        },
        child: {
          id: schema.people.id,
          firstName: schema.people.firstName,
          lastName: schema.people.lastName,
        },
      })
      .from(schema.relationships)
      .leftJoin(schema.people, eq(schema.relationships.parentId, schema.people.id))
      .where(or(
        eq(schema.relationships.parentId, id),
        eq(schema.relationships.childId, id)
      ));
    
    return c.json({ data: relationships });
  } catch (error) {
    console.error("Error fetching relationships:", error);
    throw new HTTPException(500, { message: "Failed to fetch relationships" });
  }
});

// Get family tree data for a person
app.get("/tree/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) {
    throw new HTTPException(400, { message: "Invalid person ID" });
  }

  const db = drizzle(c.env.DB, { schema });
  
  try {
    // Get the person and all their relationships
    const person = await db
      .select()
      .from(schema.people)
      .where(eq(schema.people.id, id))
      .limit(1);
    
    if (person.length === 0) {
      throw new HTTPException(404, { message: "Person not found" });
    }

    // Get all relationships involving this person
    const relationships = await db
      .select({
        id: schema.relationships.id,
        parentId: schema.relationships.parentId,
        childId: schema.relationships.childId,
        relationshipType: schema.relationships.relationshipType,
      })
      .from(schema.relationships)
      .where(or(
        eq(schema.relationships.parentId, id),
        eq(schema.relationships.childId, id)
      ));

    // Get all related people
    const relatedIds = new Set<number>();
    relationships.forEach(rel => {
      relatedIds.add(rel.parentId);
      relatedIds.add(rel.childId);
    });

    const relatedPeople = relatedIds.size > 0 
      ? await db
          .select()
          .from(schema.people)
          .where(or(...Array.from(relatedIds).map(id => eq(schema.people.id, id))))
      : [];

    return c.json({ 
      data: {
        person: person[0],
        relationships,
        relatedPeople,
      }
    });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Error fetching family tree:", error);
    throw new HTTPException(500, { message: "Failed to fetch family tree" });
  }
});

// Create relationship
app.post("/", async (c) => {
  const body = await c.req.json();
  const validation = relationshipSchema.safeParse(body);
  
  if (!validation.success) {
    throw new HTTPException(400, { 
      message: "Invalid data", 
      cause: validation.error.issues 
    });
  }

  const data = validation.data;
  const db = drizzle(c.env.DB, { schema });
  
  // Validate that parent and child are different people
  if (data.parentId === data.childId) {
    throw new HTTPException(400, { message: "Parent and child cannot be the same person" });
  }

  try {
    // Check if both people exist
    const people = await db
      .select({ id: schema.people.id })
      .from(schema.people)
      .where(or(
        eq(schema.people.id, data.parentId),
        eq(schema.people.id, data.childId)
      ));
    
    if (people.length !== 2) {
      throw new HTTPException(400, { message: "One or both people do not exist" });
    }

    // Check if relationship already exists
    const existingRelationship = await db
      .select()
      .from(schema.relationships)
      .where(
        and(
          eq(schema.relationships.parentId, data.parentId),
          eq(schema.relationships.childId, data.childId)
        )
      )
      .limit(1);
    
    if (existingRelationship.length > 0) {
      throw new HTTPException(400, { message: "Relationship already exists" });
    }

    const result = await db
      .insert(schema.relationships)
      .values({
        ...data,
        createdAt: new Date(),
      })
      .returning();
    
    return c.json({ data: result[0] }, 201);
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Error creating relationship:", error);
    throw new HTTPException(500, { message: "Failed to create relationship" });
  }
});

// Delete relationship
app.delete("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) {
    throw new HTTPException(400, { message: "Invalid relationship ID" });
  }

  const db = drizzle(c.env.DB, { schema });
  
  try {
    const result = await db
      .delete(schema.relationships)
      .where(eq(schema.relationships.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new HTTPException(404, { message: "Relationship not found" });
    }
    
    return c.json({ message: "Relationship deleted successfully" });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Error deleting relationship:", error);
    throw new HTTPException(500, { message: "Failed to delete relationship" });
  }
});

export default app;