import { jest } from "@jest/globals";

/* =====================
   MOCK sql (ESM)
===================== */
const sqlMock = jest.fn();

// Veritabanı bağlantısını taklit ediyoruz (Mock)
jest.unstable_mockModule("../../config/db.js", () => ({
  sql: (...args) => sqlMock(...args),
}));

/* =====================
   IMPORT CONTROLLER AFTER MOCKS
===================== */
const {
  getAllPassengers,
  createPassenger,
  getPassengersByFlight,
  addPassengerToFlight,
  autoAssignSeats,
  assignSeatManually,
} = await import("../../controllers/passengersController.js");

describe("Passenger Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    sqlMock.mockReset();
  });

  // =====================
  // GET ALL PASSENGERS
  // =====================
  test("getAllPassengers → returns list of passengers", async () => {
    const mockPassengers = [
      { passenger_id: 1, name: "John Doe", age: 30, gender: "Male" },
      { passenger_id: 2, name: "Jane Doe", age: 25, gender: "Female" },
    ];

    sqlMock.mockResolvedValueOnce(mockPassengers);

    await getAllPassengers(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockPassengers,
    });
  });

  test("getAllPassengers → handles database error", async () => {
    sqlMock.mockRejectedValueOnce(new Error("Database error"));

    await getAllPassengers(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Server Error",
    });
  });

  // =====================
  // CREATE PASSENGER (Standalone)
  // =====================
  test("createPassenger → returns 201 with new passenger", async () => {
    req.body = {
      name: "New User",
      age: 20,
      gender: "Male",
      nationality: "USA",
    };

    sqlMock.mockResolvedValueOnce([
      { passenger_id: 1, name: "New User", age: 20 },
    ]);

    await createPassenger(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Passenger created successfully (not assigned to flight yet)",
      data: expect.objectContaining({ passenger_id: 1 }),
    });
  });

  test("createPassenger → returns 400 if name or age missing", async () => {
    req.body = { gender: "Male" }; // Missing name & age

    await createPassenger(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Name and Age are required fields.",
    });
  });

  // =====================
  // ADD PASSENGER TO FLIGHT
  // =====================
  test("addPassengerToFlight → creates passenger and assigns to flight", async () => {
    req.body = {
      name: "Flyer One",
      age: 40,
      gender: "Female",
      nationality: "UK",
      flight_number: "TK1923",
      seat_type_id: 1,
    };

    // 1. Insert Passenger
    sqlMock.mockResolvedValueOnce([{ passenger_id: 10 }]);
    // 2. Insert Assignment
    sqlMock.mockResolvedValueOnce([]);

    await addPassengerToFlight(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Passenger added to flight",
      passengerId: 10,
    });
  });

  // =====================
  // AUTO ASSIGN SEATS (Complex Logic)
  // =====================
  test("autoAssignSeats → assigns seats successfully", async () => {
    req.params.flight_number = "TK1923";

    // Mock 1: Flight & Vehicle Info (Seating Plan)
    sqlMock.mockResolvedValueOnce([
      {
        seating_plan: {
          business: { rows: 1, seats_per_row: 2 }, // 1A, 1B available
        },
      },
    ]);

    // Mock 2: Occupied Seats (None)
    sqlMock.mockResolvedValueOnce([]);

    // Mock 3: Unseated Passengers (1 passenger wanting Business)
    sqlMock.mockResolvedValueOnce([
      { passenger_id: 101, seat_type_id: 1 },
    ]);

    // Mock 4: Seat Types Lookup
    sqlMock.mockResolvedValueOnce([
      { seat_type_id: 1, type_name: "Business" },
      { seat_type_id: 2, type_name: "Economy" },
    ]);

    // Mock 5: Update Statement (The assignment itself)
    sqlMock.mockResolvedValueOnce([]);

    await autoAssignSeats(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Successfully assigned seats to 1 passengers.",
    });
  });

  test("autoAssignSeats → returns 404 if flight not found", async () => {
    req.params.flight_number = "INVALID";
    sqlMock.mockResolvedValueOnce([]); // No flight info

    await autoAssignSeats(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Flight not found.",
    });
  });

  // =====================
  // MANUAL ASSIGN SEAT
  // =====================
  test("assignSeatManually → returns 409 if seat occupied", async () => {
    req.params.flight_number = "TK1923";
    req.body = { passenger_id: 1, seat_number: "1A" };

    // Check if occupied by someone else (returns a record)
    sqlMock.mockResolvedValueOnce([{ passenger_id: 99 }]);

    await assignSeatManually(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Seat 1A is already occupied.",
    });
  });
});