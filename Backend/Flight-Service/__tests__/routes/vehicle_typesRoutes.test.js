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

describe("Vehicle Types Routes", () => {
  beforeEach(() => {
    sqlMock.mockReset();
  });

  // =====================
  // GET /api/vehicle-types
  // =====================
  test("GET /api/vehicle-types → returns vehicle types", async () => {
    sqlMock.mockResolvedValueOnce([
      {
        id: 1,
        type_name: "Boeing 737",
        total_seats: 150,
        seating_plan: { economy: 120, business: 30 },
        max_crew: 10,
        max_passengers: 150,
        menu_description: "Standard menu",
        created_at: "2024-01-01T00:00:00.000Z",
      },
      {
        id: 2,
        type_name: "Airbus A320",
        total_seats: 180,
        seating_plan: { economy: 150, business: 30 },
        max_crew: 12,
        max_passengers: 180,
        menu_description: "Premium menu",
        created_at: "2024-01-01T00:00:00.000Z",
      },
    ]);

    const res = await request(app).get("/api/vehicle-types");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      success: true,
      count: 2,
      data: [
        {
          id: 1,
          type_name: "Boeing 737",
          total_seats: 150,
          seating_plan: { economy: 120, business: 30 },
          max_crew: 10,
          max_passengers: 150,
          menu_description: "Standard menu",
          created_at: "2024-01-01T00:00:00.000Z",
        },
        {
          id: 2,
          type_name: "Airbus A320",
          total_seats: 180,
          seating_plan: { economy: 150, business: 30 },
          max_crew: 12,
          max_passengers: 180,
          menu_description: "Premium menu",
          created_at: "2024-01-01T00:00:00.000Z",
        },
      ],
    });
  });

  test("GET /api/vehicle-types → returns empty array when no vehicle types", async () => {
    sqlMock.mockResolvedValueOnce([]);

    const res = await request(app).get("/api/vehicle-types");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      success: true,
      count: 0,
      data: [],
    });
  });

  // =====================
  // GET /api/vehicle-types/:id
  // =====================
  test("GET /api/vehicle-types/:id → returns vehicle type by id", async () => {
    sqlMock.mockResolvedValueOnce([
      {
        id: 1,
        type_name: "Boeing 737",
        total_seats: 150,
        seating_plan: { economy: 120, business: 30 },
        max_crew: 10,
        max_passengers: 150,
        menu_description: "Standard menu",
        created_at: "2024-01-01T00:00:00.000Z",
      },
    ]);

    const res = await request(app).get("/api/vehicle-types/1");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      success: true,
      data: {
        id: 1,
        type_name: "Boeing 737",
        total_seats: 150,
        seating_plan: { economy: 120, business: 30 },
        max_crew: 10,
        max_passengers: 150,
        menu_description: "Standard menu",
        created_at: "2024-01-01T00:00:00.000Z",
      },
    });
  });

  test("GET /api/vehicle-types/:id → 400 when id is not a number", async () => {
    const res = await request(app).get("/api/vehicle-types/invalid");

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      success: false,
      message: "Vehicle type ID must be a valid number",
    });
  });

  test("GET /api/vehicle-types/:id → 404 when not found", async () => {
    sqlMock.mockResolvedValueOnce([]);

    const res = await request(app).get("/api/vehicle-types/99");

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      success: false,
      message: "Vehicle type with ID 99 not found",
    });
  });

  // =====================
  // POST /api/vehicle-types
  // =====================
  test("POST /api/vehicle-types → creates vehicle type", async () => {
    sqlMock.mockResolvedValueOnce([
      {
        id: 3,
        type_name: "Boeing 777",
        total_seats: 300,
        seating_plan: { economy: 250, business: 50 },
        max_crew: 15,
        max_passengers: 300,
        menu_description: "Luxury menu",
        created_at: "2024-01-01T00:00:00.000Z",
      },
    ]);

    const res = await request(app)
      .post("/api/vehicle-types")
      .send({
        type_name: "Boeing 777",
        total_seats: 300,
        seating_plan: { economy: 250, business: 50 },
        max_crew: 15,
        max_passengers: 300,
        menu_description: "Luxury menu",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      success: true,
      message: "Vehicle type created successfully",
      data: {
        id: 3,
        type_name: "Boeing 777",
        total_seats: 300,
        seating_plan: { economy: 250, business: 50 },
        max_crew: 15,
        max_passengers: 300,
        menu_description: "Luxury menu",
        created_at: "2024-01-01T00:00:00.000Z",
      },
    });
  });

  test("POST /api/vehicle-types → 400 when missing required fields", async () => {
    const res = await request(app)
      .post("/api/vehicle-types")
      .send({
        type_name: "Boeing 777",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      success: false,
      message: "Missing required fields: type_name, total_seats, seating_plan, max_crew, max_passengers",
    });
  });

  test("POST /api/vehicle-types → 400 when max_passengers exceeds total_seats", async () => {
    const res = await request(app)
      .post("/api/vehicle-types")
      .send({
        type_name: "Boeing 777",
        total_seats: 300,
        seating_plan: { economy: 250, business: 50 },
        max_crew: 15,
        max_passengers: 350,
        menu_description: "Luxury menu",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      success: false,
      message: "max_passengers cannot exceed total_seats",
    });
  });

  // =====================
  // PUT /api/vehicle-types/:id
  // =====================
  test("PUT /api/vehicle-types/:id → updates vehicle type", async () => {
    sqlMock
      .mockResolvedValueOnce([{ id: 1 }]) // Check if vehicle type exists
      .mockResolvedValueOnce([
        {
          id: 1,
          type_name: "Boeing 737 MAX",
          total_seats: 150,
          seating_plan: { economy: 120, business: 30 },
          max_crew: 10,
          max_passengers: 150,
          menu_description: "Standard menu",
          created_at: "2024-01-01T00:00:00.000Z",
        },
      ]); // UPDATE RETURNING

    const res = await request(app)
      .put("/api/vehicle-types/1")
      .send({
        type_name: "Boeing 737 MAX",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      success: true,
      message: "Vehicle type updated successfully",
      data: {
        id: 1,
        type_name: "Boeing 737 MAX",
        total_seats: 150,
        seating_plan: { economy: 120, business: 30 },
        max_crew: 10,
        max_passengers: 150,
        menu_description: "Standard menu",
        created_at: "2024-01-01T00:00:00.000Z",
      },
    });
  });

  test("PUT /api/vehicle-types/:id → 400 when id is not a number", async () => {
    const res = await request(app)
      .put("/api/vehicle-types/invalid")
      .send({
        type_name: "Boeing 737 MAX",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      success: false,
      message: "Vehicle type ID must be a valid number",
    });
  });

  test("PUT /api/vehicle-types/:id → 404 when not found", async () => {
    sqlMock.mockResolvedValueOnce([]);

    const res = await request(app)
      .put("/api/vehicle-types/99")
      .send({
        type_name: "Boeing 737 MAX",
      });

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      success: false,
      message: "Vehicle type with ID 99 not found",
    });
  });

  test("PUT /api/vehicle-types/:id → 400 when max_passengers exceeds total_seats", async () => {
    sqlMock.mockResolvedValueOnce([{ id: 1 }]);

    const res = await request(app)
      .put("/api/vehicle-types/1")
      .send({
        max_passengers: 200,
        total_seats: 150,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      success: false,
      message: "max_passengers cannot exceed total_seats",
    });
  });

  test("PUT /api/vehicle-types/:id → 400 when no valid fields to update", async () => {
    sqlMock.mockResolvedValueOnce([{ id: 1 }]);

    const res = await request(app)
      .put("/api/vehicle-types/1")
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      success: false,
      message: "No valid fields to update",
    });
  });

  // =====================
  // DELETE /api/vehicle-types/:id
  // =====================
  test("DELETE /api/vehicle-types/:id → deletes vehicle type", async () => {
    sqlMock.mockResolvedValueOnce([
      {
        id: 1,
        type_name: "Boeing 737",
        total_seats: 150,
        seating_plan: { economy: 120, business: 30 },
        max_crew: 10,
        max_passengers: 150,
        menu_description: "Standard menu",
        created_at: "2024-01-01T00:00:00.000Z",
      },
    ]);

    const res = await request(app).delete("/api/vehicle-types/1");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      success: true,
      message: "Vehicle type deleted successfully",
      data: {
        id: 1,
        type_name: "Boeing 737",
        total_seats: 150,
        seating_plan: { economy: 120, business: 30 },
        max_crew: 10,
        max_passengers: 150,
        menu_description: "Standard menu",
        created_at: "2024-01-01T00:00:00.000Z",
      },
    });
  });

  test("DELETE /api/vehicle-types/:id → 400 when id is not a number", async () => {
    const res = await request(app).delete("/api/vehicle-types/invalid");

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      success: false,
      message: "Vehicle type ID must be a valid number",
    });
  });

  test("DELETE /api/vehicle-types/:id → 404 when not found", async () => {
    sqlMock.mockResolvedValueOnce([]);

    const res = await request(app).delete("/api/vehicle-types/99");

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      success: false,
      message: "Vehicle type with ID 99 not found",
    });
  });
});

