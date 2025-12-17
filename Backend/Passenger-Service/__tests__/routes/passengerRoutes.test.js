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
// Server.js'i import ediyoruz ki app instance'ına ulaşalım
const app = (await import("../../server.js")).default;

describe("Passenger Routes", () => {
  beforeEach(() => {
    sqlMock.mockReset();
  });

  // =====================
  // GET /api/passengers
  // =====================
  test("GET /api/passengers → returns all passengers", async () => {
    sqlMock.mockResolvedValueOnce([
      { passenger_id: 1, name: "Test User", age: 25 },
    ]);

    const res = await request(app).get("/api/passengers");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  // =====================
  // POST /api/passengers (Create Only)
  // =====================
  test("POST /api/passengers → creates a passenger", async () => {
    sqlMock.mockResolvedValueOnce([
      { passenger_id: 1, name: "New Pax", age: 30 },
    ]);

    const res = await request(app).post("/api/passengers").send({
      name: "New Pax",
      age: 30,
      gender: "Female",
      nationality: "DE",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain("Passenger created successfully");
  });

  // =====================
  // POST /api/passengers/flight-assignment (Create & Assign)
  // =====================
  test("POST /api/passengers/flight-assignment → adds to flight", async () => {
    // 1. Insert Passenger
    sqlMock.mockResolvedValueOnce([{ passenger_id: 5 }]);
    // 2. Insert Assignment
    sqlMock.mockResolvedValueOnce([]);

    const res = await request(app).post("/api/passengers/flight-assignment").send({
      name: "Flyer",
      age: 22,
      gender: "Male",
      nationality: "TR",
      flight_number: "TK101",
      seat_type_id: 2,
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  // =====================
  // GET /api/passengers/flight/:flight_number
  // =====================
  test("GET /api/passengers/flight/:flight_number → gets list", async () => {
    sqlMock.mockResolvedValueOnce([
      { name: "Pax 1", seat_number: "1A", seat_class: "Business" },
    ]);

    const res = await request(app).get("/api/passengers/flight/TK101");

    expect(res.statusCode).toBe(200);
    expect(res.body.data[0].seat_number).toBe("1A");
  });

  // =====================
  // POST /api/passengers/flight/:flight_number/assign-seats (Auto Assign)
  // =====================
  test("POST .../assign-seats → triggers auto assignment", async () => {
    // Controller logic mocks (simplified for route testing)
    sqlMock
      .mockResolvedValueOnce([{ seating_plan: { economy: { rows: 2, seats_per_row: 2 } } }]) // Flight Info
      .mockResolvedValueOnce([]) // Occupied
      .mockResolvedValueOnce([{ passenger_id: 1, seat_type_id: 2 }]) // Unseated
      .mockResolvedValueOnce([{ seat_type_id: 2, type_name: "Economy" }]) // Types
      .mockResolvedValueOnce([]); // Update

    const res = await request(app).post("/api/passengers/flight/TK101/assign-seats");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // =====================
  // PUT /api/passengers/flight/:flight_number/manual-assign
  // =====================
  test("PUT .../manual-assign → assigns seat manually", async () => {
    // Check occupied returns empty (seat available)
    sqlMock.mockResolvedValueOnce([]); 
    // Update returns updated row
    sqlMock.mockResolvedValueOnce([{ seat_number: "5F" }]);

    const res = await request(app)
      .put("/api/passengers/flight/TK101/manual-assign")
      .send({
        passenger_id: 1,
        seat_number: "5F",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});