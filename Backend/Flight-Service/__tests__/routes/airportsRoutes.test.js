import request from "supertest";
import { jest } from "@jest/globals";

/* =====================
   MOCK sql (ESM)
===================== */
const sqlMock = jest.fn();

jest.unstable_mockModule("../../config/db.js", () => ({
  sql: (...args) => sqlMock(...args),
}));

/* =====================
   IMPORT APP AFTER MOCKS
===================== */
const app = (await import("../../server.js")).default;

describe("Airports Routes", () => {
  beforeEach(() => {
    sqlMock.mockReset();
  });

  // =====================
  // GET /api/airports
  // =====================
  test("GET /api/airports → returns airports", async () => {
    sqlMock.mockResolvedValueOnce([
      { id: 1, code: "IST", name: "Istanbul Airport", city: "Istanbul", country: "Turkey", created_at: "2024-01-01T00:00:00.000Z" },
      { id: 2, code: "JFK", name: "John F. Kennedy International Airport", city: "New York", country: "USA", created_at: "2024-01-01T00:00:00.000Z" },
    ]);

    const res = await request(app).get("/api/airports");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      success: true,
      count: 2,
      data: [
        { id: 1, code: "IST", name: "Istanbul Airport", city: "Istanbul", country: "Turkey", created_at: "2024-01-01T00:00:00.000Z" },
        { id: 2, code: "JFK", name: "John F. Kennedy International Airport", city: "New York", country: "USA", created_at: "2024-01-01T00:00:00.000Z" },
      ],
    });
  });

  test("GET /api/airports → returns empty array when no airports", async () => {
    sqlMock.mockResolvedValueOnce([]);

    const res = await request(app).get("/api/airports");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      success: true,
      count: 0,
      data: [],
    });
  });

  // =====================
  // GET /api/airports/:code
  // =====================
  test("GET /api/airports/:code → returns airport by code", async () => {
    sqlMock.mockResolvedValueOnce([
      { id: 1, code: "IST", name: "Istanbul Airport", city: "Istanbul", country: "Turkey", created_at: "2024-01-01T00:00:00.000Z" },
    ]);

    const res = await request(app).get("/api/airports/IST");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      success: true,
      data: { id: 1, code: "IST", name: "Istanbul Airport", city: "Istanbul", country: "Turkey", created_at: "2024-01-01T00:00:00.000Z" },
    });
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
      { id: 3, code: "LAX", name: "Los Angeles International Airport", city: "Los Angeles", country: "USA", created_at: "2024-01-01T00:00:00.000Z" },
    ]);

    const res = await request(app)
      .post("/api/airports")
      .send({
        code: "LAX",
        name: "Los Angeles International Airport",
        city: "Los Angeles",
        country: "USA",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      success: true,
      message: "Airport created successfully",
      data: { id: 3, code: "LAX", name: "Los Angeles International Airport", city: "Los Angeles", country: "USA", created_at: "2024-01-01T00:00:00.000Z" },
    });
  });

  test("POST /api/airports → 400 when missing required fields", async () => {
    const res = await request(app)
      .post("/api/airports")
      .send({
        code: "LAX",
        name: "Los Angeles International Airport",
      });

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
        code: "LA",
        name: "Los Angeles International Airport",
        city: "Los Angeles",
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
      .mockResolvedValueOnce([{ id: 1 }]) // Check if airport exists
      .mockResolvedValueOnce([
        { id: 1, code: "IST", name: "Istanbul New Airport", city: "Istanbul", country: "Turkey", created_at: "2024-01-01T00:00:00.000Z" },
      ]); // UPDATE RETURNING

    const res = await request(app)
      .put("/api/airports/IST")
      .send({
        name: "Istanbul New Airport",
        city: "Istanbul",
        country: "Turkey",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      success: true,
      message: "Airport updated successfully",
      data: { id: 1, code: "IST", name: "Istanbul New Airport", city: "Istanbul", country: "Turkey", created_at: "2024-01-01T00:00:00.000Z" },
    });
  });

  test("PUT /api/airports/:code → 404 when not found", async () => {
    sqlMock.mockResolvedValueOnce([]);

    const res = await request(app)
      .put("/api/airports/XXX")
      .send({
        name: "Test Airport",
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
    sqlMock.mockResolvedValueOnce([
      { id: 1, code: "IST", name: "Istanbul Airport", city: "Istanbul", country: "Turkey", created_at: "2024-01-01T00:00:00.000Z" },
    ]);

    const res = await request(app).delete("/api/airports/IST");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      success: true,
      message: "Airport deleted successfully",
      data: { id: 1, code: "IST", name: "Istanbul Airport", city: "Istanbul", country: "Turkey", created_at: "2024-01-01T00:00:00.000Z" },
    });
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

