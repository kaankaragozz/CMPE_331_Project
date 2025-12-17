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
        flight_date: "2024-12-25T10:00:00.000Z",
        duration_minutes: 120,
        distance_km: 1500,
        is_shared: false,
        shared_flight_number: null,
        shared_airline_name: null,
        connecting_flight_info: null,
        created_at: "2024-01-01T00:00:00.000Z",
        updated_at: "2024-01-01T00:00:00.000Z",
        source: { country: "Turkey", city: "Istanbul", airport_name: "Istanbul Airport", airport_code: "IST" },
        destination: { country: "USA", city: "New York", airport_name: "John F. Kennedy International Airport", airport_code: "JFK" },
        vehicle_type: { id: 1, type_name: "Boeing 737", total_seats: 150, seating_plan: {}, max_crew: 10, max_passengers: 150, menu_description: "Standard menu" },
      },
    ]);

    const res = await request(app).get("/api/flights");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(1);
    expect(res.body.data).toHaveLength(1);
  });

  test("GET /api/flights → returns empty array when no flights", async () => {
    sqlMock.mockResolvedValueOnce([]);

    const res = await request(app).get("/api/flights");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      success: true,
      count: 0,
      data: [],
    });
  });

  // =====================
  // GET /api/flights/:flight_number
  // =====================
  test("GET /api/flights/:flight_number → returns flight by number", async () => {
    sqlMock.mockResolvedValueOnce([
      {
        id: 1,
        flight_number: "AA1234",
        flight_date: "2024-12-25T10:00:00.000Z",
        duration_minutes: 120,
        distance_km: 1500,
        is_shared: false,
        shared_flight_number: null,
        shared_airline_name: null,
        connecting_flight_info: null,
        created_at: "2024-01-01T00:00:00.000Z",
        updated_at: "2024-01-01T00:00:00.000Z",
        source: { country: "Turkey", city: "Istanbul", airport_name: "Istanbul Airport", airport_code: "IST" },
        destination: { country: "USA", city: "New York", airport_name: "John F. Kennedy International Airport", airport_code: "JFK" },
        vehicle_type: { id: 1, type_name: "Boeing 737", total_seats: 150, seating_plan: {}, max_crew: 10, max_passengers: 150, menu_description: "Standard menu" },
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
      .mockResolvedValueOnce([{ id: 1 }]) // Source airport lookup
      .mockResolvedValueOnce([{ id: 2 }]) // Destination airport lookup
      .mockResolvedValueOnce([{ id: 1 }]) // Vehicle type lookup
      .mockResolvedValueOnce([
        {
          id: 1,
          flight_number: "AA1234",
          flight_date: "2024-12-25T10:00:00.000Z",
          duration_minutes: 120,
          distance_km: 1500,
          source_airport_id: 1,
          destination_airport_id: 2,
          vehicle_type_id: 1,
          is_shared: false,
          created_at: "2024-01-01T00:00:00.000Z",
        },
      ]); // INSERT RETURNING

    const res = await request(app)
      .post("/api/flights")
      .send({
        flight_number: "AA1234",
        flight_date: "2024-12-25T10:00:00.000Z",
        duration_minutes: 120,
        distance_km: 1500,
        source_airport_code: "IST",
        destination_airport_code: "JFK",
        vehicle_type_id: 1,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Flight created successfully");
    expect(res.body.data.flight_number).toBe("AA1234");
  });

  test("POST /api/flights → 400 when missing required fields", async () => {
    const res = await request(app)
      .post("/api/flights")
      .send({
        flight_number: "TK001",
        flight_date: "2024-12-25T10:00:00.000Z",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      success: false,
      message: "Missing required fields: flight_number, flight_date, duration_minutes, distance_km, source_airport_code, destination_airport_code, vehicle_type_id",
    });
  });

  test("POST /api/flights → 400 when invalid flight number format", async () => {
    const res = await request(app)
      .post("/api/flights")
      .send({
        flight_number: "TK001",
        flight_date: "2024-12-25T10:00:00.000Z",
        duration_minutes: 120,
        distance_km: 1500,
        source_airport_code: "IST",
        destination_airport_code: "JFK",
        vehicle_type_id: 1,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      success: false,
      message: "Invalid flight number format. Must be in AANNNN format (e.g., AA1234)",
    });
  });

  test("POST /api/flights → 400 when is_shared but missing shared info", async () => {
    sqlMock
      .mockResolvedValueOnce([{ id: 1 }]) // Source airport lookup
      .mockResolvedValueOnce([{ id: 2 }]) // Destination airport lookup
      .mockResolvedValueOnce([{ id: 1 }]); // Vehicle type lookup

    const res = await request(app)
      .post("/api/flights")
      .send({
        flight_number: "AA1234",
        flight_date: "2024-12-25T10:00:00.000Z",
        duration_minutes: 120,
        distance_km: 1500,
        source_airport_code: "IST",
        destination_airport_code: "JFK",
        vehicle_type_id: 1,
        is_shared: true,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      success: false,
      message: "shared_flight_number and shared_airline_name are required when is_shared is true",
    });
  });

  test("POST /api/flights → 404 when source airport not found", async () => {
    sqlMock.mockResolvedValueOnce([]); // Source airport lookup - not found

    const res = await request(app)
      .post("/api/flights")
      .send({
        flight_number: "AA1234",
        flight_date: "2024-12-25T10:00:00.000Z",
        duration_minutes: 120,
        distance_km: 1500,
        source_airport_code: "XXX",
        destination_airport_code: "JFK",
        vehicle_type_id: 1,
      });

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      success: false,
      message: "Source airport with code XXX not found",
    });
  });

  // =====================
  // PUT /api/flights/:flight_number
  // =====================
  test("PUT /api/flights/:flight_number → updates flight", async () => {
    sqlMock
      .mockResolvedValueOnce([{ id: 1 }]) // Check if flight exists
      .mockResolvedValueOnce([]) // Update flight_date
      .mockResolvedValueOnce([
        {
          id: 1,
          flight_number: "AA1234",
          flight_date: "2024-12-26T10:00:00.000Z",
          duration_minutes: 120,
          distance_km: 1500,
        },
      ]); // SELECT updated flight

    const res = await request(app)
      .put("/api/flights/AA1234")
      .send({
        flight_date: "2024-12-26T10:00:00.000Z",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Flight updated successfully");
  });

  test("PUT /api/flights/:flight_number → 404 when not found", async () => {
    sqlMock.mockResolvedValueOnce([]);

    const res = await request(app)
      .put("/api/flights/AA9999")
      .send({
        flight_date: "2024-12-26T10:00:00.000Z",
      });

    expect(res.statusCode).toBe(404);
  });

  // =====================
  // DELETE /api/flights/:id
  // =====================
  test("DELETE /api/flights/:id → deletes flight", async () => {
    sqlMock.mockResolvedValueOnce([
      {
        id: 1,
        flight_number: "AA1234",
        flight_date: "2024-12-25T10:00:00.000Z",
      },
    ]);

    const res = await request(app).delete("/api/flights/1");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      success: true,
      message: "Flight deleted successfully",
      data: {
        id: 1,
        flight_number: "AA1234",
        flight_date: "2024-12-25T10:00:00.000Z",
      },
    });
  });

  test("DELETE /api/flights/:id → 404 when not found", async () => {
    sqlMock.mockResolvedValueOnce([]);

    const res = await request(app).delete("/api/flights/99");

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      success: false,
      message: "Flight with id 99 not found",
    });
  });
});

