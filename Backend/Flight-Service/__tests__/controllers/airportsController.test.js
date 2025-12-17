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
  getAllAirports,
  getAirportByCode,
  createAirport,
  updateAirport,
  deleteAirport,
} = await import("../../controllers/airportsController.js");

describe("Airports Controller", () => {
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
  // GET ALL AIRPORTS
  // =====================
  test("getAllAirports → returns list of airports", async () => {
    const mockAirports = [
      {
        id: 1,
        code: "JFK",
        name: "John F. Kennedy International Airport",
        city: "New York",
        country: "USA",
        created_at: "2024-01-01",
      },
      {
        id: 2,
        code: "LAX",
        name: "Los Angeles International Airport",
        city: "Los Angeles",
        country: "USA",
        created_at: "2024-01-01",
      },
    ];

    sqlMock.mockResolvedValueOnce(mockAirports);

    await getAllAirports(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      count: 2,
      data: mockAirports,
    });
  });

  test("getAllAirports → handles database error", async () => {
    sqlMock.mockRejectedValueOnce(new Error("Database error"));

    await getAllAirports(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal Server Error",
      error: "Database error",
    });
  });

  // =====================
  // GET AIRPORT BY CODE
  // =====================
  test("getAirportByCode → returns airport when found", async () => {
    req.params.code = "JFK";

    const mockAirport = {
      id: 1,
      code: "JFK",
      name: "John F. Kennedy International Airport",
      city: "New York",
      country: "USA",
      created_at: "2024-01-01",
    };

    sqlMock.mockResolvedValueOnce([mockAirport]);

    await getAirportByCode(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockAirport,
    });
  });

  test("getAirportByCode → returns 400 when code is missing", async () => {
    req.params.code = "";

    await getAirportByCode(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Airport code is required",
    });
  });

  test("getAirportByCode → returns 404 when airport not found", async () => {
    req.params.code = "XXX";

    sqlMock.mockResolvedValueOnce([]);

    await getAirportByCode(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Airport with code XXX not found",
    });
  });

  // =====================
  // CREATE AIRPORT
  // =====================
  test("createAirport → returns 201 with new airport", async () => {
    req.body = {
      code: "JFK",
      name: "John F. Kennedy International Airport",
      city: "New York",
      country: "USA",
    };

    sqlMock.mockResolvedValueOnce([
      {
        id: 1,
        code: "JFK",
        name: "John F. Kennedy International Airport",
        city: "New York",
        country: "USA",
        created_at: "2024-01-01",
      },
    ]);

    await createAirport(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Airport created successfully",
      data: expect.objectContaining({
        id: 1,
        code: "JFK",
        name: "John F. Kennedy International Airport",
      }),
    });
  });

  test("createAirport → returns 400 when required fields missing", async () => {
    req.body = {
      code: "JFK",
      // missing name, city, country
    };

    await createAirport(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Missing required fields: code, name, city, country",
    });
  });

  test("createAirport → returns 400 when code is not 3 characters", async () => {
    req.body = {
      code: "JF",
      name: "John F. Kennedy International Airport",
      city: "New York",
      country: "USA",
    };

    await createAirport(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Airport code must be exactly 3 characters",
    });
  });

  test("createAirport → returns 409 when airport code already exists", async () => {
    req.body = {
      code: "JFK",
      name: "John F. Kennedy International Airport",
      city: "New York",
      country: "USA",
    };

    sqlMock.mockRejectedValueOnce(new Error("unique constraint violation"));

    await createAirport(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Airport with code JFK already exists",
    });
  });

  // =====================
  // UPDATE AIRPORT
  // =====================
  test("updateAirport → returns 200 with updated airport", async () => {
    req.params.code = "JFK";
    req.body = {
      name: "Updated Airport Name",
      city: "Updated City",
      country: "Updated Country",
    };

    sqlMock.mockResolvedValueOnce([{ id: 1 }]); // existing airport check
    sqlMock.mockResolvedValueOnce([
      {
        id: 1,
        code: "JFK",
        name: "Updated Airport Name",
        city: "Updated City",
        country: "Updated Country",
        created_at: "2024-01-01",
      },
    ]); // UPDATE RETURNING

    await updateAirport(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Airport updated successfully",
      data: expect.objectContaining({
        code: "JFK",
        name: "Updated Airport Name",
      }),
    });
  });

  test("updateAirport → returns 400 when code is missing", async () => {
    req.params.code = "";
    req.body = { name: "Updated Name" };

    await updateAirport(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Airport code is required",
    });
  });

  test("updateAirport → returns 404 when airport not found", async () => {
    req.params.code = "XXX";
    req.body = { name: "Updated Name" };

    sqlMock.mockResolvedValueOnce([]); // airport not found

    await updateAirport(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Airport with code XXX not found",
    });
  });

  test("updateAirport → returns 400 when no valid fields to update", async () => {
    req.params.code = "JFK";
    req.body = {}; // empty body

    sqlMock.mockResolvedValueOnce([{ id: 1 }]); // existing airport check

    await updateAirport(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "No valid fields to update",
    });
  });

  test("updateAirport → updates only name when provided", async () => {
    req.params.code = "JFK";
    req.body = {
      name: "Updated Airport Name",
    };

    sqlMock.mockResolvedValueOnce([{ id: 1 }]); // existing airport check
    sqlMock.mockResolvedValueOnce([
      {
        id: 1,
        code: "JFK",
        name: "Updated Airport Name",
        city: "New York",
        country: "USA",
        created_at: "2024-01-01",
      },
    ]); // UPDATE RETURNING

    await updateAirport(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Airport updated successfully",
      data: expect.objectContaining({
        name: "Updated Airport Name",
      }),
    });
  });

  // =====================
  // DELETE AIRPORT
  // =====================
  test("deleteAirport → deletes airport successfully", async () => {
    req.params.code = "JFK";

    sqlMock.mockResolvedValueOnce([
      {
        id: 1,
        code: "JFK",
        name: "John F. Kennedy International Airport",
        city: "New York",
        country: "USA",
        created_at: "2024-01-01",
      },
    ]);

    await deleteAirport(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Airport deleted successfully",
      data: expect.objectContaining({
        id: 1,
        code: "JFK",
      }),
    });
  });

  test("deleteAirport → returns 400 when code is missing", async () => {
    req.params.code = "";

    await deleteAirport(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Airport code is required",
    });
  });

  test("deleteAirport → returns 404 when airport not found", async () => {
    req.params.code = "XXX";

    sqlMock.mockResolvedValueOnce([]);

    await deleteAirport(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Airport with code XXX not found",
    });
  });

  test("deleteAirport → handles database error", async () => {
    req.params.code = "JFK";

    sqlMock.mockRejectedValueOnce(new Error("Database error"));

    await deleteAirport(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal Server Error",
      error: "Database error",
    });
  });
});

