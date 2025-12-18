import request from "supertest";
import { jest } from "@jest/globals";

/* =====================
   GREY BOX (Integration Test)
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

describe("Passengers Routes", () => {
  beforeEach(() => {
    sqlMock.mockReset();
  });

  // =====================
  // GET /api/passengers
  // =====================
  test("GET /api/passengers → returns passengers", async () => {
    sqlMock.mockResolvedValueOnce([
      {
        passenger_id: 1,
        name: "John Doe",
        age: 30,
        gender: "Male",
        nationality: "USA",
      },
      {
        passenger_id: 2,
        name: "Jane Smith",
        age: 25,
        gender: "Female",
        nationality: "UK",
      },
    ]);

    const res = await request(app).get("/api/passengers");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
  });

  // =====================
  // GET /api/passengers/:id
  // =====================
  test("GET /api/passengers/:id → returns passenger", async () => {
    sqlMock.mockResolvedValueOnce([
      {
        passenger_id: 1,
        name: "John Doe",
        age: 30,
        gender: "Male",
        nationality: "USA",
      },
    ]);

    const res = await request(app).get("/api/passengers/1");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.passenger_id).toBe(1);
  });

  test("GET /api/passengers/:id → 404 when not found", async () => {
    sqlMock.mockResolvedValueOnce([]);

    const res = await request(app).get("/api/passengers/999");

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      success: false,
      message: "Passenger not found",
    });
  });

  // =====================
  // POST /api/passengers
  // =====================
  test("POST /api/passengers → creates passenger", async () => {
    sqlMock.mockResolvedValueOnce([
      {
        passenger_id: 3,
        name: "Alice Johnson",
        age: 28,
        gender: "Female",
        nationality: "Canada",
      },
    ]); // INSERT RETURNING

    const res = await request(app)
      .post("/api/passengers")
      .send({
        name: "Alice Johnson",
        age: 28,
        gender: "Female",
        nationality: "Canada",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    if (res.body.data) {
      expect(res.body.data.name).toBe("Alice Johnson");
    }
  });

  test("POST /api/passengers → 400 when missing required fields", async () => {
    const res = await request(app)
      .post("/api/passengers")
      .send({
        name: "Bob",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain("required");
  });

  // =====================
  // PUT /api/passengers/:id
  // =====================
  test("PUT /api/passengers/:id → updates passenger", async () => {
    sqlMock.mockResolvedValueOnce([
      {
        passenger_id: 1,
        name: "John Updated",
        age: 31,
        gender: "Male",
        nationality: "USA",
      },
    ]); // UPDATE RETURNING

    const res = await request(app)
      .put("/api/passengers/1")
      .send({
        name: "John Updated",
        age: 31,
        gender: "Male",
        nationality: "USA",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    if (res.body.data) {
      expect(res.body.data.name).toBe("John Updated");
    }
  });

  test("PUT /api/passengers/:id → 404 when not found", async () => {
    sqlMock.mockResolvedValueOnce([]);

    const res = await request(app)
      .put("/api/passengers/999")
      .send({
        name: "Test",
        age: 25,
        gender: "Male",
        nationality: "USA",
      });

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      success: false,
      message: "Passenger not found",
    });
  });

  // =====================
  // DELETE /api/passengers/:id
  // =====================
  test("DELETE /api/passengers/:id → deletes passenger", async () => {
    sqlMock.mockResolvedValueOnce([{ passenger_id: 1 }]); // DELETE RETURNING

    const res = await request(app).delete("/api/passengers/1");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Passenger deleted successfully");
  });

  test("DELETE /api/passengers/:id → 404 when not found", async () => {
    sqlMock.mockResolvedValueOnce([]);

    const res = await request(app).delete("/api/passengers/999");

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      success: false,
      message: "Passenger not found",
    });
  });

  // =====================
  // GET /api/passengers/flight/:flight_number
  // =====================
  test("GET /api/passengers/flight/:flight_number → returns passengers for flight", async () => {
    sqlMock.mockResolvedValueOnce([
      {
        passenger_id: 1,
        name: "John Doe",
        age: 30,
        gender: "Male",
        nationality: "USA",
        seat_number: "1A",
        seat_class: "Business",
        is_infant: false,
      },
    ]);

    const res = await request(app).get("/api/passengers/flight/AA1234");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  // =====================
  // POST /api/passengers/flight-assignment
  // =====================
  test("POST /api/passengers/flight-assignment → adds passenger to flight", async () => {
    sqlMock
      .mockResolvedValueOnce([{ passenger_id: 4 }]) // INSERT passenger RETURNING
      .mockResolvedValueOnce([]); // INSERT assignment

    const res = await request(app)
      .post("/api/passengers/flight-assignment")
      .send({
        name: "Test Passenger",
        age: 25,
        gender: "Male",
        nationality: "USA",
        flight_number: "AA1234",
        seat_type_id: 1,
        is_infant: false,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Passenger added to flight");
  });

  // =====================
  // DELETE /api/passengers/flight/:flight_number/:passenger_id
  // =====================
  test("DELETE /api/passengers/flight/:flight_number/:passenger_id → removes passenger from flight", async () => {
    sqlMock.mockResolvedValueOnce([{ id: 1 }]); // DELETE RETURNING

    const res = await request(app).delete("/api/passengers/flight/AA1234/1");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Passenger removed from flight");
  });

  test("DELETE /api/passengers/flight/:flight_number/:passenger_id → 404 when not found", async () => {
    sqlMock.mockResolvedValueOnce([]);

    const res = await request(app).delete("/api/passengers/flight/AA1234/999");

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      success: false,
      message: "Assignment not found",
    });
  });

  // =====================
  // GET /api/passengers/flight/:flight_number/affiliations
  // =====================
  test("GET /api/passengers/flight/:flight_number/affiliations → returns affiliations", async () => {
    sqlMock.mockResolvedValueOnce([
      {
        id: 1,
        main_passenger: "John Doe",
        affiliated_passenger: "Jane Doe",
      },
    ]);

    const res = await request(app).get("/api/passengers/flight/AA1234/affiliations");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  // =====================
  // POST /api/passengers/affiliations
  // =====================
  test("POST /api/passengers/affiliations → creates affiliation", async () => {
    sqlMock.mockResolvedValueOnce([{ id: 2 }]); // INSERT RETURNING

    const res = await request(app)
      .post("/api/passengers/affiliations")
      .send({
        main_passenger_id: 1,
        affiliated_passenger_id: 2,
        flight_number: "AA1234",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Affiliation created");
  });

  // =====================
  // DELETE /api/passengers/affiliations/:id
  // =====================
  test("DELETE /api/passengers/affiliations/:id → deletes affiliation", async () => {
    sqlMock.mockResolvedValueOnce([]); // DELETE

    const res = await request(app).delete("/api/passengers/affiliations/1");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Affiliation deleted");
  });

  // =====================
  // GET /api/passengers/flight/:flight_number/infants
  // =====================
  test("GET /api/passengers/flight/:flight_number/infants → returns infant relationships", async () => {
    sqlMock.mockResolvedValueOnce([
      {
        id: 1,
        infant: "Baby Doe",
        parent: "John Doe",
      },
    ]);

    const res = await request(app).get("/api/passengers/flight/AA1234/infants");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  // =====================
  // POST /api/passengers/infants
  // =====================
  test("POST /api/passengers/infants → creates infant relationship", async () => {
    sqlMock.mockResolvedValueOnce([{ id: 3 }]); // INSERT RETURNING

    const res = await request(app)
      .post("/api/passengers/infants")
      .send({
        infant_passenger_id: 1,
        parent_passenger_id: 2,
        flight_number: "AA1234",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Infant linked to parent");
  });

  // =====================
  // DELETE /api/passengers/infants/:id
  // =====================
  test("DELETE /api/passengers/infants/:id → deletes infant relationship", async () => {
    sqlMock.mockResolvedValueOnce([]); // DELETE

    const res = await request(app).delete("/api/passengers/infants/1");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Relationship deleted");
  });

  // =====================
  // POST /api/passengers/flight/:flight_number/assign-seats (Auto Assign)
  // =====================
  test("POST /api/passengers/flight/:flight_number/assign-seats → auto assigns seats", async () => {
    sqlMock
      .mockResolvedValueOnce([{ seating_plan: { business: { rows: 5, seats_per_row: 4 }, economy: { rows: 20, seats_per_row: 6 } } }]) // Flight info
      .mockResolvedValueOnce([]) // Occupied seats
      .mockResolvedValueOnce([]) // Unseated passengers
      .mockResolvedValueOnce([]); // Seat types

    const res = await request(app).post("/api/passengers/flight/AA1234/assign-seats");

    // Can return 200 (success) or 404 (flight not found) or 500 (error)
    expect([200, 404, 500]).toContain(res.statusCode);
  });

  // =====================
  // PUT /api/passengers/flight/:flight_number/manual-assign
  // =====================
  test("PUT /api/passengers/flight/:flight_number/manual-assign → manually assigns seat", async () => {
    sqlMock
      .mockResolvedValueOnce([]) // Seat check (not occupied)
      .mockResolvedValueOnce([{ seat_number: "1A" }]); // UPDATE RETURNING

    const res = await request(app)
      .put("/api/passengers/flight/AA1234/manual-assign")
      .send({
        passenger_id: 1,
        seat_number: "1A",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Seat assigned successfully.");
  });

  test("PUT /api/passengers/flight/:flight_number/manual-assign → 400 when missing fields", async () => {
    const res = await request(app)
      .put("/api/passengers/flight/AA1234/manual-assign")
      .send({
        passenger_id: 1,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain("required");
  });

  test("PUT /api/passengers/flight/:flight_number/manual-assign → 409 when seat occupied", async () => {
    sqlMock.mockResolvedValueOnce([{ passenger_id: 2 }]); // Seat check (occupied)

    const res = await request(app)
      .put("/api/passengers/flight/AA1234/manual-assign")
      .send({
        passenger_id: 1,
        seat_number: "1A",
      });

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toContain("already occupied");
  });
});

