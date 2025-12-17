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

describe("Flights Routes", () => {
  beforeEach(() => {
    sqlMock.mockReset();
  });

  // =====================
  // GET /api/flights
  // =====================
  test("GET /api/flights → returns flights", async () => {
    sqlMock.mockResolvedValueOnce([
      {
        id: 1,
        flight_number: "AA1234",
        flight_date: "2024-01-15",
        duration_minutes: 300,
        distance_km: 2000,
        is_shared: false,
        shared_flight_number: null,
        shared_airline_name: null,
        connecting_flight_info: null,
        created_at: "2024-01-01T00:00:00.000Z",
        updated_at: "2024-01-01T00:00:00.000Z",
        source: { country: "USA", city: "New York", airport_name: "JFK", airport_code: "JFK" },
        destination: { country: "USA", city: "Los Angeles", airport_name: "LAX", airport_code: "LAX" },
        vehicle_type: { id: 1, type_name: "Boeing 737", total_seats: 150, seating_plan: {}, max_crew: 6, max_passengers: 150, menu_description: "Standard" },
      },
    ]);

    const res = await request(app).get("/api/flights");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(1);
    expect(res.body.data).toHaveLength(1);
  });

  // =====================
  // GET /api/flights/:flight_number
  // =====================
  test("GET /api/flights/:flight_number → returns flight", async () => {
    sqlMock.mockResolvedValueOnce([
      {
        id: 1,
        flight_number: "AA1234",
        flight_date: "2024-01-15",
        duration_minutes: 300,
        distance_km: 2000,
        is_shared: false,
        shared_flight_number: null,
        shared_airline_name: null,
        connecting_flight_info: null,
        created_at: "2024-01-01T00:00:00.000Z",
        updated_at: "2024-01-01T00:00:00.000Z",
        source: { country: "USA", city: "New York", airport_name: "JFK", airport_code: "JFK" },
        destination: { country: "USA", city: "Los Angeles", airport_name: "LAX", airport_code: "LAX" },
        vehicle_type: { id: 1, type_name: "Boeing 737", total_seats: 150, seating_plan: {}, max_crew: 6, max_passengers: 150, menu_description: "Standard" },
      },
    ]);

    const res = await request(app).get("/api/flights/AA1234");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.flight_number).toBe("AA1234");
  });

  test("GET /api/flights/:flight_number → 400 when invalid format", async () => {
    const res = await request(app).get("/api/flights/INVALID");

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      success: false,
      message: "Invalid flight number format. Must be in AANNNN format (e.g., AA1234)",
    });
  });

  test("GET /api/flights/:flight_number → 404 when not found", async () => {
    sqlMock.mockResolvedValueOnce([]);

    const res = await request(app).get("/api/flights/AA9999");

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      success: false,
      message: "Flight with number AA9999 not found",
    });
  });

  // =====================
  // POST /api/flights
  // =====================
  test("POST /api/flights → creates flight", async () => {
    sqlMock
      .mockResolvedValueOnce([{ id: 1 }]) // SELECT source airport
      .mockResolvedValueOnce([{ id: 2 }]) // SELECT destination airport
      .mockResolvedValueOnce([{ id: 1 }]) // SELECT vehicle type
      .mockResolvedValueOnce([
        {
          id: 3,
          flight_number: "AA5678",
          flight_date: "2024-01-20T00:00:00.000Z",
          duration_minutes: 350,
          distance_km: 2500,
          source_airport_id: 1,
          destination_airport_id: 2,
          vehicle_type_id: 1,
          is_shared: false,
          shared_flight_number: null,
          shared_airline_name: null,
          connecting_flight_info: null,
          created_at: "2024-01-01T00:00:00.000Z",
          updated_at: "2024-01-01T00:00:00.000Z",
        },
      ]); // INSERT RETURNING

    const res = await request(app)
      .post("/api/flights")
      .send({
        flight_number: "AA5678",
        flight_date: "2024-01-20",
        source_airport_code: "JFK",
        destination_airport_code: "LAX",
        vehicle_type_id: 1,
        duration_minutes: 350,
        distance_km: 2500,
        is_shared: false,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    if (res.body.data) {
      expect(res.body.data.flight_number).toBe("AA5678");
    }
  });

  test("POST /api/flights → 400 when missing fields", async () => {
    const res = await request(app)
      .post("/api/flights")
      .send({
        flight_number: "AA5678",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain("Missing required fields");
  });

  test("POST /api/flights → 400 when invalid flight number format", async () => {
    const res = await request(app)
      .post("/api/flights")
      .send({
        flight_number: "INVALID",
        flight_date: "2024-01-20",
        source_airport_code: "JFK",
        destination_airport_code: "LAX",
        vehicle_type_id: 1,
        duration_minutes: 350,
        distance_km: 2500,
        is_shared: false,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain("Invalid flight number format");
  });

  // =====================
  // PUT /api/flights/:flight_number
  // =====================
  test("PUT /api/flights/:flight_number → updates flight", async () => {
    sqlMock
      .mockResolvedValueOnce([{ id: 1, flight_number: "AA1234" }]) // SELECT existing
      .mockResolvedValueOnce([]) // UPDATE flight_date
      .mockResolvedValueOnce([]) // UPDATE duration_minutes
      .mockResolvedValueOnce([
        {
          id: 1,
          flight_number: "AA1234",
          flight_date: "2024-01-25T00:00:00.000Z",
          duration_minutes: 320,
          distance_km: 2100,
          source_airport_id: 1,
          destination_airport_id: 2,
          vehicle_type_id: 1,
          is_shared: false,
          shared_flight_number: null,
          shared_airline_name: null,
          connecting_flight_info: null,
          created_at: "2024-01-01T00:00:00.000Z",
          updated_at: "2024-01-01T00:00:00.000Z",
        },
      ]); // SELECT updated flight

    const res = await request(app)
      .put("/api/flights/AA1234")
      .send({
        flight_date: "2024-01-25",
        duration_minutes: 320,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    if (res.body.data) {
      expect(res.body.data.duration_minutes).toBe(320);
    }
  });

  test("PUT /api/flights/:flight_number → 404 when not found", async () => {
    sqlMock.mockResolvedValueOnce([]);

    const res = await request(app)
      .put("/api/flights/AA9999")
      .send({
        flight_date: "2024-01-25",
      });

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      success: false,
      message: "Flight with number AA9999 not found",
    });
  });

  // =====================
  // DELETE /api/flights/:id
  // =====================
  test("DELETE /api/flights/:id → deletes flight", async () => {
    sqlMock
      .mockResolvedValueOnce([{ id: 1, flight_number: "AA1234", flight_date: "2024-01-15", duration_minutes: 300, distance_km: 2000, is_shared: false, shared_flight_number: null, shared_airline_name: null, connecting_flight_info: null, created_at: "2024-01-01" }]) // SELECT existing
      .mockResolvedValueOnce([]); // DELETE

    const res = await request(app).delete("/api/flights/1");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Flight deleted successfully");
    expect(res.body.data).toBeDefined();
  });

  test("DELETE /api/flights/:id → 404 when not found", async () => {
    sqlMock.mockResolvedValueOnce([]);

    const res = await request(app).delete("/api/flights/999");

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      success: false,
      message: "Flight with id 999 not found",
    });
  });
});

