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

describe("Vehicle Types Routes", () => {
  beforeEach(() => {
    sqlMock.mockReset();
  });

  // =====================
  // GET /api/vehicle-types
  // =====================
  test("GET /api/vehicle-types → returns vehicle types", async () => {
    sqlMock.mockResolvedValueOnce([
      { id: 1, type_name: "Boeing 737", total_seats: 150, seating_plan: {}, max_crew: 6, max_passengers: 150, menu_description: "Standard", created_at: "2024-01-01" },
      { id: 2, type_name: "Airbus A320", total_seats: 180, seating_plan: {}, max_crew: 7, max_passengers: 180, menu_description: "Premium", created_at: "2024-01-01" },
    ]);

    const res = await request(app).get("/api/vehicle-types");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(2);
    expect(res.body.data).toHaveLength(2);
  });

  // =====================
  // GET /api/vehicle-types/:id
  // =====================
  test("GET /api/vehicle-types/:id → returns vehicle type", async () => {
    sqlMock.mockResolvedValueOnce([
      { id: 1, type_name: "Boeing 737", total_seats: 150, seating_plan: {}, max_crew: 6, max_passengers: 150, menu_description: "Standard", created_at: "2024-01-01" },
    ]);

    const res = await request(app).get("/api/vehicle-types/1");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(1);
    expect(res.body.data.type_name).toBe("Boeing 737");
  });

  test("GET /api/vehicle-types/:id → 404 when not found", async () => {
    sqlMock.mockResolvedValueOnce([]);

    const res = await request(app).get("/api/vehicle-types/999");

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      success: false,
      message: "Vehicle type with ID 999 not found",
    });
  });

  // =====================
  // POST /api/vehicle-types
  // =====================
  test("POST /api/vehicle-types → creates vehicle type", async () => {
    sqlMock.mockResolvedValueOnce([
      { id: 3, type_name: "Boeing 787", total_seats: 242, seating_plan: {}, max_crew: 10, max_passengers: 242, menu_description: "Luxury", created_at: "2024-01-01" },
    ]); // INSERT RETURNING

    const res = await request(app)
      .post("/api/vehicle-types")
      .send({
        type_name: "Boeing 787",
        total_seats: 242,
        seating_plan: {},
        max_crew: 10,
        max_passengers: 242,
        menu_description: "Luxury",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    if (res.body.data) {
      expect(res.body.data.type_name).toBe("Boeing 787");
    }
  });

  test("POST /api/vehicle-types → 400 when missing fields", async () => {
    const res = await request(app)
      .post("/api/vehicle-types")
      .send({
        type_name: "Boeing 787",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain("Missing required fields");
  });

  // =====================
  // PUT /api/vehicle-types/:id
  // =====================
  test("PUT /api/vehicle-types/:id → updates vehicle type", async () => {
    sqlMock
      .mockResolvedValueOnce([{ id: 1 }]) // SELECT existing
      .mockResolvedValueOnce([
        { id: 1, type_name: "Boeing 737 MAX", total_seats: 172, seating_plan: {}, max_crew: 6, max_passengers: 172, menu_description: "Standard", created_at: "2024-01-01" },
      ]); // UPDATE RETURNING

    const res = await request(app)
      .put("/api/vehicle-types/1")
      .send({
        type_name: "Boeing 737 MAX",
        total_seats: 172,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.type_name).toBe("Boeing 737 MAX");
  });

  test("PUT /api/vehicle-types/:id → 404 when not found", async () => {
    sqlMock.mockResolvedValueOnce([]);

    const res = await request(app)
      .put("/api/vehicle-types/999")
      .send({
        type_name: "Boeing 737 MAX",
      });

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      success: false,
      message: "Vehicle type with ID 999 not found",
    });
  });

  // =====================
  // DELETE /api/vehicle-types/:id
  // =====================
  test("DELETE /api/vehicle-types/:id → deletes vehicle type", async () => {
    sqlMock
      .mockResolvedValueOnce([{ id: 1, type_name: "Boeing 737", total_seats: 150, seating_plan: {}, max_crew: 6, max_passengers: 150, menu_description: "Standard", created_at: "2024-01-01" }]) // SELECT existing
      .mockResolvedValueOnce([]); // DELETE

    const res = await request(app).delete("/api/vehicle-types/1");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Vehicle type deleted successfully");
    expect(res.body.data).toBeDefined();
  });

  test("DELETE /api/vehicle-types/:id → 404 when not found", async () => {
    sqlMock.mockResolvedValueOnce([]);

    const res = await request(app).delete("/api/vehicle-types/999");

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      success: false,
      message: "Vehicle type with ID 999 not found",
    });
  });
});

