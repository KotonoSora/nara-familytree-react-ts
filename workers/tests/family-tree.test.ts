import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";

import { default as appRoute } from "~/workers/app";

describe("Family Tree API", () => {
  beforeAll(() => {
    vi.stubEnv("NODE_ENV", "vitest");
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  test("GET /api/people returns empty array initially", async () => {
    const res = await appRoute.request("/api/people");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("data");
    expect(Array.isArray(data.data)).toBe(true);
  });

  test("POST /api/people creates a new person", async () => {
    const personData = {
      firstName: "John",
      lastName: "Doe",
      gender: "male",
      birthDate: "1990-01-01",
    };

    const res = await appRoute.request("/api/people", {
      method: "POST",
      body: JSON.stringify(personData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data).toHaveProperty("data");
    expect(data.data).toMatchObject({
      firstName: "John",
      lastName: "Doe",
      gender: "male",
    });
  });

  test("POST /api/people validates required fields", async () => {
    const invalidData = {
      firstName: "", // Missing required field
      lastName: "Doe",
    };

    const res = await appRoute.request("/api/people", {
      method: "POST",
      body: JSON.stringify(invalidData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(res.status).toBe(400);
  });

  test("GET /api/relationships/tree/:id handles non-existent person", async () => {
    const res = await appRoute.request("/api/relationships/tree/999");
    expect(res.status).toBe(404);
  });
});