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
  getAllVehicleTypes,
  getVehicleTypeById,
  createVehicleType,
  updateVehicleType,
  deleteVehicleType,
} = await import("../../controllers/vehicle_typesController.js");

describe("Vehicle Types Controller", () => {
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
  // GET ALL VEHICLE TYPES
  // =====================
  test("getAllVehicleTypes → returns list of vehicle types", async () => {
    const mockVehicleTypes = [
      {
        id: 1,
        type_name: "Boeing 737",
        total_seats: 150,
        seating_plan: { rows: 30, seats_per_row: 5 },
        max_crew: 8,
        max_passengers: 150,
        menu_description: "Standard menu",
        created_at: "2024-01-01",
      },
      {
        id: 2,
        type_name: "Airbus A320",
        total_seats: 180,
        seating_plan: { rows: 30, seats_per_row: 6 },
        max_crew: 10,
        max_passengers: 180,
        menu_description: "Premium menu",
        created_at: "2024-01-01",
      },
    ];

    sqlMock.mockResolvedValueOnce(mockVehicleTypes);

    await getAllVehicleTypes(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      count: 2,
      data: mockVehicleTypes,
    });
  });

  test("getAllVehicleTypes → handles database error", async () => {
    sqlMock.mockRejectedValueOnce(new Error("Database error"));

    await getAllVehicleTypes(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal Server Error",
      error: "Database error",
    });
  });

  // =====================
  // GET VEHICLE TYPE BY ID
  // =====================
  test("getVehicleTypeById → returns vehicle type when found", async () => {
    req.params.id = "1";

    const mockVehicleType = {
      id: 1,
      type_name: "Boeing 737",
      total_seats: 150,
      seating_plan: { rows: 30, seats_per_row: 5 },
      max_crew: 8,
      max_passengers: 150,
      menu_description: "Standard menu",
      created_at: "2024-01-01",
    };

    sqlMock.mockResolvedValueOnce([mockVehicleType]);

    await getVehicleTypeById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockVehicleType,
    });
  });

  test("getVehicleTypeById → returns 400 when ID is invalid", async () => {
    req.params.id = "invalid";

    await getVehicleTypeById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Vehicle type ID must be a valid number",
    });
  });

  test("getVehicleTypeById → returns 404 when vehicle type not found", async () => {
    req.params.id = "999";

    sqlMock.mockResolvedValueOnce([]);

    await getVehicleTypeById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Vehicle type with ID 999 not found",
    });
  });

  // =====================
  // CREATE VEHICLE TYPE
  // =====================
  test("createVehicleType → returns 201 with new vehicle type", async () => {
    req.body = {
      type_name: "Boeing 737",
      total_seats: 150,
      seating_plan: { rows: 30, seats_per_row: 5 },
      max_crew: 8,
      max_passengers: 150,
      menu_description: "Standard menu",
    };

    sqlMock.mockResolvedValueOnce([
      {
        id: 1,
        type_name: "Boeing 737",
        total_seats: 150,
        seating_plan: { rows: 30, seats_per_row: 5 },
        max_crew: 8,
        max_passengers: 150,
        menu_description: "Standard menu",
        created_at: "2024-01-01",
      },
    ]);

    await createVehicleType(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Vehicle type created successfully",
      data: expect.objectContaining({
        id: 1,
        type_name: "Boeing 737",
      }),
    });
  });

  test("createVehicleType → returns 400 when required fields missing", async () => {
    req.body = {
      type_name: "Boeing 737",
      // missing other required fields
    };

    await createVehicleType(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message:
        "Missing required fields: type_name, total_seats, seating_plan, max_crew, max_passengers",
    });
  });

  test("createVehicleType → returns 400 when max_passengers exceeds total_seats", async () => {
    req.body = {
      type_name: "Boeing 737",
      total_seats: 150,
      seating_plan: { rows: 30, seats_per_row: 5 },
      max_crew: 8,
      max_passengers: 200, // exceeds total_seats
      menu_description: "Standard menu",
    };

    await createVehicleType(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "max_passengers cannot exceed total_seats",
    });
  });

  test("createVehicleType → returns 409 when vehicle type already exists", async () => {
    req.body = {
      type_name: "Boeing 737",
      total_seats: 150,
      seating_plan: { rows: 30, seats_per_row: 5 },
      max_crew: 8,
      max_passengers: 150,
    };

    sqlMock.mockRejectedValueOnce(new Error("unique constraint violation"));

    await createVehicleType(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Vehicle type 'Boeing 737' already exists",
    });
  });

  // =====================
  // UPDATE VEHICLE TYPE
  // =====================
  test("updateVehicleType → returns 200 with updated vehicle type", async () => {
    req.params.id = "1";
    req.body = {
      type_name: "Boeing 737-800",
    };

    sqlMock.mockResolvedValueOnce([{ id: 1 }]); // existing vehicle type check
    sqlMock.mockResolvedValueOnce([
      {
        id: 1,
        type_name: "Boeing 737-800",
        total_seats: 150,
        seating_plan: { rows: 30, seats_per_row: 5 },
        max_crew: 8,
        max_passengers: 150,
        menu_description: "Standard menu",
        created_at: "2024-01-01",
      },
    ]); // UPDATE RETURNING

    await updateVehicleType(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Vehicle type updated successfully",
      data: expect.objectContaining({
        id: 1,
        type_name: "Boeing 737-800",
      }),
    });
  });

  test("updateVehicleType → returns 400 when ID is invalid", async () => {
    req.params.id = "invalid";
    req.body = { type_name: "Updated Name" };

    await updateVehicleType(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Vehicle type ID must be a valid number",
    });
  });

  test("updateVehicleType → returns 404 when vehicle type not found", async () => {
    req.params.id = "999";
    req.body = { type_name: "Updated Name" };

    sqlMock.mockResolvedValueOnce([]); // vehicle type not found

    await updateVehicleType(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Vehicle type with ID 999 not found",
    });
  });

  test("updateVehicleType → returns 400 when max_passengers exceeds total_seats", async () => {
    req.params.id = "1";
    req.body = {
      total_seats: 150,
      max_passengers: 200, // exceeds total_seats
    };

    sqlMock.mockResolvedValueOnce([{ id: 1 }]); // existing vehicle type check

    await updateVehicleType(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "max_passengers cannot exceed total_seats",
    });
  });

  test("updateVehicleType → returns 400 when no valid fields to update", async () => {
    req.params.id = "1";
    req.body = {}; // empty body

    sqlMock.mockResolvedValueOnce([{ id: 1 }]); // existing vehicle type check

    await updateVehicleType(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "No valid fields to update",
    });
  });

  test("updateVehicleType → updates only max_passengers when provided", async () => {
    req.params.id = "1";
    req.body = {
      max_passengers: 140,
    };

    sqlMock.mockResolvedValueOnce([{ id: 1 }]); // existing vehicle type check
    sqlMock.mockResolvedValueOnce([
      {
        id: 1,
        type_name: "Boeing 737",
        total_seats: 150,
        seating_plan: { rows: 30, seats_per_row: 5 },
        max_crew: 8,
        max_passengers: 140,
        menu_description: "Standard menu",
        created_at: "2024-01-01",
      },
    ]); // UPDATE RETURNING

    await updateVehicleType(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Vehicle type updated successfully",
      data: expect.objectContaining({
        max_passengers: 140,
      }),
    });
  });

  // =====================
  // DELETE VEHICLE TYPE
  // =====================
  test("deleteVehicleType → deletes vehicle type successfully", async () => {
    req.params.id = "1";

    sqlMock.mockResolvedValueOnce([
      {
        id: 1,
        type_name: "Boeing 737",
        total_seats: 150,
        seating_plan: { rows: 30, seats_per_row: 5 },
        max_crew: 8,
        max_passengers: 150,
        menu_description: "Standard menu",
        created_at: "2024-01-01",
      },
    ]);

    await deleteVehicleType(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Vehicle type deleted successfully",
      data: expect.objectContaining({
        id: 1,
        type_name: "Boeing 737",
      }),
    });
  });

  test("deleteVehicleType → returns 400 when ID is invalid", async () => {
    req.params.id = "invalid";

    await deleteVehicleType(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Vehicle type ID must be a valid number",
    });
  });

  test("deleteVehicleType → returns 404 when vehicle type not found", async () => {
    req.params.id = "999";

    sqlMock.mockResolvedValueOnce([]);

    await deleteVehicleType(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Vehicle type with ID 999 not found",
    });
  });

  test("deleteVehicleType → handles database error", async () => {
    req.params.id = "1";

    sqlMock.mockRejectedValueOnce(new Error("Database error"));

    await deleteVehicleType(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal Server Error",
      error: "Database error",
    });
  });
});

