
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
  getAllAttendantTypes,
  getAttendantType,
  createAttendantType,
  updateAttendantType,
  deleteAttendantType,
} = await import("../../controllers/attendant_typesController.js");

describe("Attendant Types Controller", () => {
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
  // GET ALL ATTENDANT TYPES
  // =====================
  test("getAllAttendantTypes → returns list of attendant types", async () => {
    const mockAttendantTypes = [
      { id: 1, type_name: "Flight Attendant", min_count: 2, max_count: 10 },
      { id: 2, type_name: "Purser", min_count: 1, max_count: 2 },
    ];

    sqlMock.mockResolvedValueOnce(mockAttendantTypes);

    await getAllAttendantTypes(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockAttendantTypes,
    });
  });

  test("getAllAttendantTypes → returns 404 when empty", async () => {
    sqlMock.mockResolvedValueOnce([]);

    await getAllAttendantTypes(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "No attendant types found",
    });
  });

  test("getAllAttendantTypes → handles database error", async () => {
    sqlMock.mockRejectedValueOnce(new Error("Database error"));

    await getAllAttendantTypes(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal Server Error",
    });
  });

  // =====================
  // GET ATTENDANT TYPE BY ID
  // =====================
  test("getAttendantType → returns attendant type", async () => {
    req.params = { id: "1" };
    const mockAttendantType = { id: 1, type_name: "Flight Attendant", min_count: 2, max_count: 10 };

    sqlMock.mockResolvedValueOnce([mockAttendantType]);

    await getAttendantType(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockAttendantType,
    });
  });

  test("getAttendantType → returns 404 when not found", async () => {
    req.params = { id: "999" };
    sqlMock.mockResolvedValueOnce([]);

    await getAttendantType(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Attendant type not found",
    });
  });

  test("getAttendantType → handles database error", async () => {
    req.params = { id: "1" };
    sqlMock.mockRejectedValueOnce(new Error("Database error"));

    await getAttendantType(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal Server Error",
    });
  });

  // =====================
  // CREATE ATTENDANT TYPE
  // =====================
  test("createAttendantType → creates attendant type", async () => {
    req.body = {
      type_name: "Flight Attendant",
      min_count: 2,
      max_count: 10,
    };

    const mockAttendantType = { id: 1, type_name: "Flight Attendant", min_count: 2, max_count: 10 };

    sqlMock.mockResolvedValueOnce([mockAttendantType]);

    await createAttendantType(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockAttendantType,
    });
  });

  test("createAttendantType → handles database error", async () => {
    req.body = {
      type_name: "Flight Attendant",
      min_count: 2,
      max_count: 10,
    };

    sqlMock.mockRejectedValueOnce(new Error("Database error"));

    await createAttendantType(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal Server Error",
    });
  });

  // =====================
  // UPDATE ATTENDANT TYPE
  // =====================
  test("updateAttendantType → updates attendant type", async () => {
    req.params = { id: "1" };
    req.body = {
      type_name: "Senior Flight Attendant",
      min_count: 3,
      max_count: 12,
    };

    const mockAttendantType = { id: 1, type_name: "Senior Flight Attendant", min_count: 3, max_count: 12 };

    sqlMock.mockResolvedValueOnce([mockAttendantType]);

    await updateAttendantType(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockAttendantType,
    });
  });

  test("updateAttendantType → returns 404 when not found", async () => {
    req.params = { id: "999" };
    req.body = {
      type_name: "Senior Flight Attendant",
      min_count: 3,
      max_count: 12,
    };

    sqlMock.mockResolvedValueOnce([]);

    await updateAttendantType(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Attendant type not found",
    });
  });

  test("updateAttendantType → handles database error", async () => {
    req.params = { id: "1" };
    req.body = {
      type_name: "Senior Flight Attendant",
      min_count: 3,
      max_count: 12,
    };

    sqlMock.mockRejectedValueOnce(new Error("Database error"));

    await updateAttendantType(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal Server Error",
    });
  });

  // =====================
  // DELETE ATTENDANT TYPE
  // =====================
  test("deleteAttendantType → deletes attendant type", async () => {
    req.params = { id: "1" };

    sqlMock.mockResolvedValueOnce([]);

    await deleteAttendantType(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Attendant type deleted successfully",
    });
  });

  test("deleteAttendantType → handles database error", async () => {
    req.params = { id: "1" };

    sqlMock.mockRejectedValueOnce(new Error("Database error"));

    await deleteAttendantType(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal Server Error",
    });
  });
});

