import { jest } from "@jest/globals";

/* =====================
   MOCK sql (ESM)
===================== */
const sqlMock = jest.fn();

jest.unstable_mockModule("../../config/db.js", () => ({
  sql: (...args) => sqlMock(...args),
}));

/* =====================
   IMPORT CONTROLLER AFTER MOCKS
===================== */
const {
  getAllFlights,
  getFlightByNumber,
  createFlight,
  updateFlight,
  deleteFlight,
} = await import("../../controllers/flightsController.js");

describe("Flights Controller", () => {
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
  // GET ALL FLIGHTS
  // =====================
  test("getAllFlights → returns list of flights", async () => {
    const mockFlights = [
      {
        id: 1,
        flight_number: "AA1234",
        flight_date: "2024-01-01T10:00:00Z",
        duration_minutes: 120,
        distance_km: 500,
        is_shared: false,
        source: {
          country: "USA",
          city: "New York",
          airport_name: "JFK",
          airport_code: "JFK",
        },
        destination: {
          country: "USA",
          city: "Los Angeles",
          airport_name: "LAX",
          airport_code: "LAX",
        },
        vehicle_type: {
          id: 1,
          type_name: "Boeing 737",
          total_seats: 150,
        },
      },
    ];

    sqlMock.mockResolvedValueOnce(mockFlights);

    await getAllFlights(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      count: 1,
      data: mockFlights,
    });
  });

  test("getAllFlights → handles database error", async () => {
    sqlMock.mockRejectedValueOnce(new Error("Database error"));

    await getAllFlights(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal Server Error",
      error: "Database error",
    });
  });

  // =====================
  // GET FLIGHT BY NUMBER
  // =====================
  test("getFlightByNumber → returns flight when found", async () => {
    req.params.flight_number = "AA1234";

    const mockFlight = {
      id: 1,
      flight_number: "AA1234",
      flight_date: "2024-01-01T10:00:00Z",
      duration_minutes: 120,
      distance_km: 500,
    };

    sqlMock.mockResolvedValueOnce([mockFlight]);

    await getFlightByNumber(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockFlight,
    });
  });

  test("getFlightByNumber → returns 400 for invalid format", async () => {
    req.params.flight_number = "INVALID";

    await getFlightByNumber(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid flight number format. Must be in AANNNN format (e.g., AA1234)",
    });
  });

  test("getFlightByNumber → returns 404 when flight not found", async () => {
    req.params.flight_number = "AA9999";

    sqlMock.mockResolvedValueOnce([]);

    await getFlightByNumber(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Flight with number AA9999 not found",
    });
  });

  // =====================
  // CREATE FLIGHT
  // =====================
  test("createFlight → returns 201 with new flight", async () => {
    req.body = {
      flight_number: "AA1234",
      flight_date: "2024-01-01T10:00:00Z",
      duration_minutes: 120,
      distance_km: 500,
      source_airport_code: "JFK",
      destination_airport_code: "LAX",
      vehicle_type_id: 1,
      is_shared: false,
    };

    sqlMock.mockResolvedValueOnce([{ id: 1 }]); // source airport
    sqlMock.mockResolvedValueOnce([{ id: 2 }]); // destination airport
    sqlMock.mockResolvedValueOnce([{ id: 1 }]); // vehicle type
    sqlMock.mockResolvedValueOnce([
      {
        id: 1,
        flight_number: "AA1234",
        flight_date: "2024-01-01T10:00:00Z",
        duration_minutes: 120,
        distance_km: 500,
      },
    ]); // INSERT RETURNING

    await createFlight(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Flight created successfully",
      data: expect.objectContaining({
        id: 1,
        flight_number: "AA1234",
      }),
    });
  });

  test("createFlight → returns 400 when required fields missing", async () => {
    req.body = {
      flight_number: "AA1234",
      // missing other required fields
    };

    await createFlight(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message:
        "Missing required fields: flight_number, flight_date, duration_minutes, distance_km, source_airport_code, destination_airport_code, vehicle_type_id",
    });
  });

  test("createFlight → returns 400 for invalid flight number format", async () => {
    req.body = {
      flight_number: "INVALID",
      flight_date: "2024-01-01T10:00:00Z",
      duration_minutes: 120,
      distance_km: 500,
      source_airport_code: "JFK",
      destination_airport_code: "LAX",
      vehicle_type_id: 1,
    };

    await createFlight(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid flight number format. Must be in AANNNN format (e.g., AA1234)",
    });
  });

  test("createFlight → returns 404 when source airport not found", async () => {
    req.body = {
      flight_number: "AA1234",
      flight_date: "2024-01-01T10:00:00Z",
      duration_minutes: 120,
      distance_km: 500,
      source_airport_code: "XXX",
      destination_airport_code: "LAX",
      vehicle_type_id: 1,
    };

    sqlMock.mockResolvedValueOnce([]); // source airport not found

    await createFlight(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Source airport with code XXX not found",
    });
  });

  test("createFlight → returns 404 when vehicle type not found", async () => {
    req.body = {
      flight_number: "AA1234",
      flight_date: "2024-01-01T10:00:00Z",
      duration_minutes: 120,
      distance_km: 500,
      source_airport_code: "JFK",
      destination_airport_code: "LAX",
      vehicle_type_id: 999,
    };

    sqlMock.mockResolvedValueOnce([{ id: 1 }]); // source airport
    sqlMock.mockResolvedValueOnce([{ id: 2 }]); // destination airport
    sqlMock.mockResolvedValueOnce([]); // vehicle type not found

    await createFlight(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Vehicle type with id 999 not found",
    });
  });

  test("createFlight → returns 400 when shared flight info missing", async () => {
    req.body = {
      flight_number: "AA1234",
      flight_date: "2024-01-01T10:00:00Z",
      duration_minutes: 120,
      distance_km: 500,
      source_airport_code: "JFK",
      destination_airport_code: "LAX",
      vehicle_type_id: 1,
      is_shared: true,
      // missing shared_flight_number and shared_airline_name
    };

    await createFlight(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message:
        "shared_flight_number and shared_airline_name are required when is_shared is true",
    });
  });

  test("createFlight → returns 409 when flight number already exists", async () => {
    req.body = {
      flight_number: "AA1234",
      flight_date: "2024-01-01T10:00:00Z",
      duration_minutes: 120,
      distance_km: 500,
      source_airport_code: "JFK",
      destination_airport_code: "LAX",
      vehicle_type_id: 1,
    };

    sqlMock.mockResolvedValueOnce([{ id: 1 }]); // source airport
    sqlMock.mockResolvedValueOnce([{ id: 2 }]); // destination airport
    sqlMock.mockResolvedValueOnce([{ id: 1 }]); // vehicle type
    sqlMock.mockRejectedValueOnce(new Error("unique constraint violation")); // INSERT fails

    await createFlight(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Flight number AA1234 already exists",
    });
  });

  // =====================
  // UPDATE FLIGHT
  // =====================
  test("updateFlight → returns 200 with updated flight", async () => {
    req.params.flight_number = "AA1234";
    req.body = {
      duration_minutes: 150,
    };

    sqlMock.mockResolvedValueOnce([{ id: 1 }]); // existing flight check
    sqlMock.mockResolvedValueOnce({}); // UPDATE duration_minutes
    sqlMock.mockResolvedValueOnce([
      {
        id: 1,
        flight_number: "AA1234",
        duration_minutes: 150,
      },
    ]); // SELECT updated flight

    await updateFlight(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Flight updated successfully",
      data: expect.objectContaining({
        id: 1,
        flight_number: "AA1234",
      }),
    });
  });

  test("updateFlight → returns 400 for invalid flight number format", async () => {
    req.params.flight_number = "INVALID";
    req.body = { duration_minutes: 150 };

    await updateFlight(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid flight number format. Must be in AANNNN format",
    });
  });

  test("updateFlight → returns 404 when flight not found", async () => {
    req.params.flight_number = "AA9999";
    req.body = { duration_minutes: 150 };

    sqlMock.mockResolvedValueOnce([]); // flight not found

    await updateFlight(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Flight with number AA9999 not found",
    });
  });

  test("updateFlight → returns 400 when no valid fields to update", async () => {
    req.params.flight_number = "AA1234";
    req.body = {}; // empty body

    sqlMock.mockResolvedValueOnce([{ id: 1 }]); // existing flight check

    await updateFlight(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "No valid fields to update",
    });
  });

  // =====================
  // DELETE FLIGHT
  // =====================
  test("deleteFlight → deletes flight successfully", async () => {
    req.params.id = "1";

    sqlMock.mockResolvedValueOnce([
      {
        id: 1,
        flight_number: "AA1234",
      },
    ]);

    await deleteFlight(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Flight deleted successfully",
      data: expect.objectContaining({
        id: 1,
        flight_number: "AA1234",
      }),
    });
  });

  test("deleteFlight → returns 404 when flight not found", async () => {
    req.params.id = "999";

    sqlMock.mockResolvedValueOnce([]);

    await deleteFlight(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Flight with id 999 not found",
    });
  });

  test("deleteFlight → handles database error", async () => {
    req.params.id = "1";

    sqlMock.mockRejectedValueOnce(new Error("Database error"));

    await deleteFlight(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal Server Error",
      error: "Database error",
    });
  });
});

