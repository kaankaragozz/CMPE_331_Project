import request from "supertest";
import { jest } from "@jest/globals";

/* =====================
   GREY BOX (integration Test)
===================== */

/* =====================
   MOCK sql (ESM)
===================== */
const sqlMock = jest.fn();

jest.unstable_mockModule("../../../config/db.js", () => ({
  sql: (...args) => sqlMock(...args),
}));

/* =====================
   IMPORT APP AFTER MOCKS
===================== */
const app = (await import("../../../server.js")).default;

describe("Airports Routes", () => {
  beforeEach(() => {
    sqlMock.mockReset();
  });

  // =====================
  // GET /api/airports
  // =====================
  test("GET /api/airports → returns airports", async () => {
    sqlMock.mockResolvedValueOnce([
      { id: 1, code: "JFK", name: "John F. Kennedy International Airport", city: "New York", country: "USA", created_at: "2024-01-01" },
      { id: 2, code: "LAX", name: "Los Angeles International Airport", city: "Los Angeles", country: "USA", created_at: "2024-01-01" },
    ]);

    const res = await request(app).get("/api/airports");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(2);
    expect(res.body.data).toHaveLength(2);
  });

  // =====================
  // GET /api/airports/:code
  // =====================
  test("GET /api/airports/:code → returns airport", async () => {
    sqlMock.mockResolvedValueOnce([
      { id: 1, code: "JFK", name: "John F. Kennedy International Airport", city: "New York", country: "USA", created_at: "2024-01-01" },
    ]);

    const res = await request(app).get("/api/airports/JFK");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.code).toBe("JFK");
  });

  test("GET /api/airports/:code → 404 when not found", async () => {
    sqlMock.mockResolvedValueOnce([]);

    const res = await request(app).get("/api/airports/XXX");

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      success: false,
      message: "Airport with code XXX not found",
    });
  });

  // =====================
  // POST /api/airports
  // =====================
  test("POST /api/airports → creates airport", async () => {
    sqlMock.mockResolvedValueOnce([
      { id: 3, code: "ORD", name: "O'Hare International Airport", city: "Chicago", country: "USA", created_at: "2024-01-01" },
    ]); // INSERT RETURNING

    const res = await request(app)
      .post("/api/airports")
      .send({
        code: "ORD",
        name: "O'Hare International Airport",
        city: "Chicago",
        country: "USA",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    if (res.body.data) {
      expect(res.body.data.code).toBe("ORD");
    }
  });

  test("POST /api/airports → 400 when missing fields", async () => {
    const res = await request(app)
      .post("/api/airports")
      .send({ code: "ORD" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      success: false,
      message: "Missing required fields: code, name, city, country",
    });
  });

  test("POST /api/airports → 400 when code is not 3 characters", async () => {
    const res = await request(app)
      .post("/api/airports")
      .send({
        code: "OR",
        name: "O'Hare International Airport",
        city: "Chicago",
        country: "USA",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      success: false,
      message: "Airport code must be exactly 3 characters",
    });
  });

  // =====================
  // PUT /api/airports/:code
  // =====================
  test("PUT /api/airports/:code → updates airport", async () => {
    sqlMock
      .mockResolvedValueOnce([{ id: 1, code: "JFK" }]) // SELECT existing
      .mockResolvedValueOnce([
        { id: 1, code: "JFK", name: "Updated Airport Name", city: "New York", country: "USA", created_at: "2024-01-01" },
      ]); // UPDATE RETURNING

    const res = await request(app)
      .put("/api/airports/JFK")
      .send({
        name: "Updated Airport Name",
        city: "New York",
        country: "USA",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("Updated Airport Name");
  });

  test("PUT /api/airports/:code → 404 when not found", async () => {
    sqlMock.mockResolvedValueOnce([]);

    const res = await request(app)
      .put("/api/airports/XXX")
      .send({
        name: "Updated Airport Name",
      });

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      success: false,
      message: "Airport with code XXX not found",
    });
  });

  // =====================
  // DELETE /api/airports/:code
  // =====================
  test("DELETE /api/airports/:code → deletes airport", async () => {
    sqlMock
      .mockResolvedValueOnce([{ id: 1, code: "JFK", name: "JFK Airport", city: "New York", country: "USA", created_at: "2024-01-01" }]) // SELECT existing
      .mockResolvedValueOnce([]); // DELETE

    const res = await request(app).delete("/api/airports/JFK");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Airport deleted successfully");
    expect(res.body.data).toBeDefined();
  });

  test("DELETE /api/airports/:code → 404 when not found", async () => {
    sqlMock.mockResolvedValueOnce([]);

    const res = await request(app).delete("/api/airports/XXX");

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      success: false,
      message: "Airport with code XXX not found",
    });
  });
});

