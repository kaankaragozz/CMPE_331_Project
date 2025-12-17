import { jest } from "@jest/globals";

/* =====================
   MOCK sql (ESM)
===================== */
const sqlMock = jest.fn();

jest.unstable_mockModule("../../config/db.js", () => ({
  sql: (...args) => sqlMock(...args),
}));

/* =====================
   MOCK getPilotWithLanguages (ESM)
===================== */
const getPilotWithLanguagesMock = jest.fn();

jest.unstable_mockModule("../../controllers/pilots_languagesController.js", () => ({
  getPilotWithLanguages: getPilotWithLanguagesMock,
}));

/* =====================
   IMPORT CONTROLLER AFTER MOCKS
===================== */
const {
  getAllPilots,
  getPilotById,
  createPilot,
  updatePilot,
  deletePilot,
} = await import("../../controllers/pilotsController.js");

describe("Pilots Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    sqlMock.mockReset();
    getPilotWithLanguagesMock.mockReset();
  });

  // =====================
  // GET ALL PILOTS
  // =====================
  test("getAllPilots → returns list of pilots", async () => {
    const mockPilots = [
      {
        id: 1,
        name: "John Doe",
        age: 35,
        gender: "Male",
        nationality: "American",
        vehicle_restriction: "Boeing 737",
        allowed_range: "International",
        seniority_level: "Senior",
        created_at: "2024-01-01T00:00:00.000Z",
        updated_at: "2024-01-01T00:00:00.000Z",
        languages: ["English", "Spanish"],
      },
      {
        id: 2,
        name: "Jane Smith",
        age: 28,
        gender: "Female",
        nationality: "British",
        vehicle_restriction: "Airbus A320",
        allowed_range: "Domestic",
        seniority_level: "Junior",
        created_at: "2024-01-01T00:00:00.000Z",
        updated_at: "2024-01-01T00:00:00.000Z",
        languages: ["English"],
      },
    ];

    sqlMock.mockResolvedValueOnce(mockPilots);

    await getAllPilots(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      count: 2,
      filters: {
        vehicle_type_id: null,
        seniority_level: null,
      },
      data: mockPilots,
    });
  });

  test("getAllPilots → filters by seniority_level", async () => {
    req.query = { seniority_level: "Senior" };
    const mockPilots = [
      {
        id: 1,
        name: "John Doe",
        age: 35,
        gender: "Male",
        nationality: "American",
        vehicle_restriction: "Boeing 737",
        allowed_range: "International",
        seniority_level: "Senior",
        created_at: "2024-01-01T00:00:00.000Z",
        updated_at: "2024-01-01T00:00:00.000Z",
        languages: ["English"],
      },
    ];

    sqlMock.mockResolvedValueOnce(mockPilots);

    await getAllPilots(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      count: 1,
      filters: {
        vehicle_type_id: null,
        seniority_level: "Senior",
      },
      data: mockPilots,
    });
  });

  test("getAllPilots → handles database error", async () => {
    sqlMock.mockRejectedValueOnce(new Error("Database error"));

    await getAllPilots(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Error fetching pilots",
      error: "Database error",
    });
  });

  // =====================
  // GET PILOT BY ID
  // =====================
  test("getPilotById → returns pilot", async () => {
    req.params = { id: "1" };
    const mockPilot = {
      id: 1,
      name: "John Doe",
      age: 35,
      gender: "Male",
      nationality: "American",
      vehicle_restriction: "Boeing 737",
      allowed_range: "International",
      seniority_level: "Senior",
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-01-01T00:00:00.000Z",
      languages: ["English", "Spanish"],
    };

    getPilotWithLanguagesMock.mockResolvedValueOnce(mockPilot);

    await getPilotById(req, res);

    expect(getPilotWithLanguagesMock).toHaveBeenCalledWith("1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockPilot,
    });
  });

  test("getPilotById → returns 404 when not found", async () => {
    req.params = { id: "999" };
    getPilotWithLanguagesMock.mockResolvedValueOnce(null);

    await getPilotById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Pilot not found",
    });
  });

  test("getPilotById → handles database error", async () => {
    req.params = { id: "1" };
    getPilotWithLanguagesMock.mockRejectedValueOnce(new Error("Database error"));

    await getPilotById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Error fetching pilot",
      error: "Database error",
    });
  });

  // =====================
  // CREATE PILOT
  // =====================
  test("createPilot → creates pilot successfully", async () => {
    req.body = {
      name: "John Doe",
      age: 35,
      gender: "Male",
      nationality: "American",
      vehicle_type_id: 1,
      allowed_range: "International",
      seniority_level: "Senior",
      language_ids: [1, 2],
    };

    sqlMock
      .mockResolvedValueOnce([{ id: 1 }]) // INSERT RETURNING id
      .mockResolvedValueOnce([]) // Insert language 1
      .mockResolvedValueOnce([]); // Insert language 2

    const mockPilot = {
      id: 1,
      name: "John Doe",
      age: 35,
      gender: "Male",
      nationality: "American",
      vehicle_restriction: "Boeing 737",
      allowed_range: "International",
      seniority_level: "Senior",
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-01-01T00:00:00.000Z",
      languages: ["English", "Spanish"],
    };

    getPilotWithLanguagesMock.mockResolvedValueOnce(mockPilot);

    await createPilot(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Pilot created successfully",
      data: mockPilot,
    });
  });

  test("createPilot → returns 400 when missing required fields", async () => {
    req.body = {
      name: "John Doe",
      age: 35,
    };

    await createPilot(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "All fields are required: name, age, gender, nationality, vehicle_type_id, allowed_range, seniority_level",
    });
  });

  test("createPilot → returns 400 when invalid seniority_level", async () => {
    req.body = {
      name: "John Doe",
      age: 35,
      gender: "Male",
      nationality: "American",
      vehicle_type_id: 1,
      allowed_range: "International",
      seniority_level: "Invalid",
    };

    await createPilot(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "seniority_level must be one of: Senior, Junior, Trainee",
    });
  });

  test("createPilot → handles database error", async () => {
    req.body = {
      name: "John Doe",
      age: 35,
      gender: "Male",
      nationality: "American",
      vehicle_type_id: 1,
      allowed_range: "International",
      seniority_level: "Senior",
    };

    sqlMock.mockRejectedValueOnce(new Error("Database error"));

    await createPilot(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Error creating pilot",
      error: "Database error",
    });
  });

  // =====================
  // UPDATE PILOT
  // =====================
  test("updatePilot → updates pilot successfully", async () => {
    req.params = { id: "1" };
    req.body = {
      name: "John Updated",
      age: 36,
    };

    sqlMock
      .mockResolvedValueOnce([{ id: 1 }]) // Check if pilot exists
      .mockResolvedValueOnce([]) // Update name
      .mockResolvedValueOnce([]); // Update age

    const mockPilot = {
      id: 1,
      name: "John Updated",
      age: 36,
      gender: "Male",
      nationality: "American",
      vehicle_restriction: "Boeing 737",
      allowed_range: "International",
      seniority_level: "Senior",
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-01-01T00:00:00.000Z",
      languages: ["English"],
    };

    getPilotWithLanguagesMock.mockResolvedValueOnce(mockPilot);

    await updatePilot(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Pilot updated successfully",
      data: mockPilot,
    });
  });

  test("updatePilot → returns 404 when pilot not found", async () => {
    req.params = { id: "999" };
    req.body = { name: "John Updated" };

    sqlMock.mockResolvedValueOnce([]); // Pilot not found

    await updatePilot(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Pilot not found",
    });
  });

  test("updatePilot → returns 400 when invalid seniority_level", async () => {
    req.params = { id: "1" };
    req.body = { seniority_level: "Invalid" };

    sqlMock.mockResolvedValueOnce([{ id: 1 }]); // Pilot exists

    await updatePilot(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "seniority_level must be one of: Senior, Junior, Trainee",
    });
  });

  test("updatePilot → handles database error", async () => {
    req.params = { id: "1" };
    req.body = { name: "John Updated" };

    sqlMock.mockResolvedValueOnce([{ id: 1 }]).mockRejectedValueOnce(new Error("Database error"));

    await updatePilot(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Error updating pilot",
      error: "Database error",
    });
  });

  // =====================
  // DELETE PILOT
  // =====================
  test("deletePilot → deletes pilot successfully", async () => {
    req.params = { id: "1" };

    sqlMock
      .mockResolvedValueOnce([{ id: 1 }]) // Check if pilot exists
      .mockResolvedValueOnce([]); // DELETE

    await deletePilot(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Pilot deleted successfully",
    });
  });

  test("deletePilot → returns 404 when pilot not found", async () => {
    req.params = { id: "999" };

    sqlMock.mockResolvedValueOnce([]); // Pilot not found

    await deletePilot(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Pilot not found",
    });
  });

  test("deletePilot → handles database error", async () => {
    req.params = { id: "1" };

    sqlMock.mockResolvedValueOnce([{ id: 1 }]).mockRejectedValueOnce(new Error("Database error"));

    await deletePilot(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Error deleting pilot",
      error: "Database error",
    });
  });
});

