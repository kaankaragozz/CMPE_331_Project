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
   MOCK getPilotWithLanguages (ESM)  
   Note: This is needed because pilotsController imports getPilotWithLanguages
===================== */
const getPilotWithLanguagesMock = jest.fn();

jest.unstable_mockModule("../../controllers/pilots_languagesController.js", () => ({
  getPilotWithLanguages: getPilotWithLanguagesMock,
  getAllPilots: jest.fn(),
  getPilotById: jest.fn(),
  filterPilots: jest.fn(),
  deleteAllPilotLanguages: jest.fn(),
  deletePilotLanguage: jest.fn(),
}));

/* =====================
   IMPORT APP AFTER MOCKS
===================== */
const app = (await import("../../server.js")).default;

describe("Pilots Routes", () => {
  beforeEach(() => {
    sqlMock.mockReset();
    getPilotWithLanguagesMock.mockReset();
  });

  // =====================
  // GET /api/pilots
  // =====================
  test("GET /api/pilots → returns pilots", async () => {
    sqlMock.mockResolvedValueOnce([
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
    ]);

    const res = await request(app).get("/api/pilots");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(1);
    expect(res.body.data).toHaveLength(1);
  });

  test("GET /api/pilots → filters by seniority_level", async () => {
    sqlMock.mockResolvedValueOnce([
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
    ]);

    const res = await request(app).get("/api/pilots?seniority_level=Senior");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.filters.seniority_level).toBe("Senior");
  });

  // =====================
  // GET /api/pilots/:id
  // =====================
  test("GET /api/pilots/:id → returns pilot by id", async () => {
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

    const res = await request(app).get("/api/pilots/1");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(1);
    expect(res.body.data.name).toBe("John Doe");
  });

  test("GET /api/pilots/:id → 404 when not found", async () => {
    getPilotWithLanguagesMock.mockResolvedValueOnce(null);

    const res = await request(app).get("/api/pilots/999");

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      success: false,
      message: "Pilot not found",
    });
  });

  // =====================
  // POST /api/pilots
  // =====================
  test("POST /api/pilots → creates pilot", async () => {
    sqlMock
      .mockResolvedValueOnce([{ id: 1 }]) // INSERT RETURNING id
      .mockResolvedValueOnce([]) // Insert language
      .mockResolvedValueOnce([]); // Insert language

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
      languages: ["English"],
    };

    getPilotWithLanguagesMock.mockResolvedValueOnce(mockPilot);

    const res = await request(app)
      .post("/api/pilots")
      .send({
        name: "John Doe",
        age: 35,
        gender: "Male",
        nationality: "American",
        vehicle_type_id: 1,
        allowed_range: "International",
        seniority_level: "Senior",
        language_ids: [1, 2],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Pilot created successfully");
    expect(res.body.data.id).toBe(1);
  });

  test("POST /api/pilots → 400 when missing required fields", async () => {
    const res = await request(app)
      .post("/api/pilots")
      .send({
        name: "John Doe",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      success: false,
      message: "All fields are required: name, age, gender, nationality, vehicle_type_id, allowed_range, seniority_level",
    });
  });

  test("POST /api/pilots → 400 when invalid seniority_level", async () => {
    const res = await request(app)
      .post("/api/pilots")
      .send({
        name: "John Doe",
        age: 35,
        gender: "Male",
        nationality: "American",
        vehicle_type_id: 1,
        allowed_range: "International",
        seniority_level: "Invalid",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      success: false,
      message: "seniority_level must be one of: Senior, Junior, Trainee",
    });
  });

  // =====================
  // PUT /api/pilots/:id
  // =====================
  test("PUT /api/pilots/:id → updates pilot", async () => {
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

    const res = await request(app)
      .put("/api/pilots/1")
      .send({
        name: "John Updated",
        age: 36,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Pilot updated successfully");
  });

  test("PUT /api/pilots/:id → 404 when not found", async () => {
    sqlMock.mockResolvedValueOnce([]);

    const res = await request(app)
      .put("/api/pilots/999")
      .send({
        name: "John Updated",
      });

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      success: false,
      message: "Pilot not found",
    });
  });

  // =====================
  // DELETE /api/pilots/:id
  // =====================
  test("DELETE /api/pilots/:id → deletes pilot", async () => {
    sqlMock
      .mockResolvedValueOnce([{ id: 1 }]) // Check if pilot exists
      .mockResolvedValueOnce([]); // DELETE

    const res = await request(app).delete("/api/pilots/1");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      success: true,
      message: "Pilot deleted successfully",
    });
  });

  test("DELETE /api/pilots/:id → 404 when not found", async () => {
    sqlMock.mockResolvedValueOnce([]);

    const res = await request(app).delete("/api/pilots/999");

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      success: false,
      message: "Pilot not found",
    });
  });
});

