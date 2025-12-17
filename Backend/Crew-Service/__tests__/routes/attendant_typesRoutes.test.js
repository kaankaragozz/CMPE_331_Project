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

describe("Attendant Types Routes", () => {
  beforeEach(() => {
    sqlMock.mockReset();
  });

  // =====================
  // GET /api/attendant-types
  // =====================
  test("GET /api/attendant-types → returns attendant types", async () => {
    sqlMock.mockResolvedValueOnce([
      { id: 1, type_name: "Flight Attendant", min_count: 2, max_count: 10 },
      { id: 2, type_name: "Purser", min_count: 1, max_count: 2 },
    ]);

    const res = await request(app).get("/api/attendant-types");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
  });

  test("GET /api/attendant-types → 404 when empty", async () => {
    sqlMock.mockResolvedValueOnce([]);

    const res = await request(app).get("/api/attendant-types");

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      success: false,
      message: "No attendant types found",
    });
  });

  // =====================
  // GET /api/attendant-types/:id
  // =====================
  test("GET /api/attendant-types/:id → returns attendant type by id", async () => {
    sqlMock.mockResolvedValueOnce([
      { id: 1, type_name: "Flight Attendant", min_count: 2, max_count: 10 },
    ]);

    const res = await request(app).get("/api/attendant-types/1");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(1);
  });

  test("GET /api/attendant-types/:id → 404 when not found", async () => {
    sqlMock.mockResolvedValueOnce([]);

    const res = await request(app).get("/api/attendant-types/999");

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      success: false,
      message: "Attendant type not found",
    });
  });

  // =====================
  // POST /api/attendant-types
  // =====================
  test("POST /api/attendant-types → creates attendant type", async () => {
    sqlMock.mockResolvedValueOnce([
      { id: 3, type_name: "Senior Flight Attendant", min_count: 3, max_count: 12 },
    ]);

    const res = await request(app)
      .post("/api/attendant-types")
      .send({
        type_name: "Senior Flight Attendant",
        min_count: 3,
        max_count: 12,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.type_name).toBe("Senior Flight Attendant");
  });

  // =====================
  // PUT /api/attendant-types/:id
  // =====================
  test("PUT /api/attendant-types/:id → updates attendant type", async () => {
    sqlMock.mockResolvedValueOnce([
      { id: 1, type_name: "Senior Flight Attendant", min_count: 3, max_count: 12 },
    ]);

    const res = await request(app)
      .put("/api/attendant-types/1")
      .send({
        type_name: "Senior Flight Attendant",
        min_count: 3,
        max_count: 12,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.type_name).toBe("Senior Flight Attendant");
  });

  test("PUT /api/attendant-types/:id → 404 when not found", async () => {
    sqlMock.mockResolvedValueOnce([]);

    const res = await request(app)
      .put("/api/attendant-types/999")
      .send({
        type_name: "Senior Flight Attendant",
        min_count: 3,
        max_count: 12,
      });

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      success: false,
      message: "Attendant type not found",
    });
  });

  // =====================
  // DELETE /api/attendant-types/:id
  // =====================
  test("DELETE /api/attendant-types/:id → deletes attendant type", async () => {
    sqlMock.mockResolvedValueOnce([]);

    const res = await request(app).delete("/api/attendant-types/1");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      success: true,
      message: "Attendant type deleted successfully",
    });
  });
});

