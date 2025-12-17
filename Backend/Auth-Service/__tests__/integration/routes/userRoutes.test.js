import request from "supertest";
import { jest } from "@jest/globals";

/* =====================
   GREY BOX (integration Test)
===================== */

/* =====================
   MOCK sql (ESM)
===================== */
const sqlMock = jest.fn();

jest.unstable_mockModule("../../../config/db.js", () => ({
  sql: (...args) => sqlMock(...args),
}));

/* =====================
   MOCK bcrypt (needed for POST)
===================== */
const hashMock = jest.fn();

jest.unstable_mockModule("bcryptjs", () => ({
  default: {
    hash: hashMock,
  },
}));

/* =====================
   IMPORT APP AFTER MOCKS
===================== */
const app = (await import("../../../server.js")).default;

describe("User Routes", () => {
  beforeEach(() => {
    sqlMock.mockReset();
    hashMock.mockReset();
  });

  // =====================
  // GET /api/users
  // =====================
  test("GET /api/users → returns users", async () => {
    sqlMock.mockResolvedValueOnce([
      { id: 1, name: "Alice", role: "Passenger" },
      { id: 2, name: "Bob", role: "Admin" },
    ]);

    const res = await request(app).get("/api/users");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([
      { id: 1, name: "Alice", role: "Passenger" },
      { id: 2, name: "Bob", role: "Admin" },
    ]);
  });

  // =====================
  // GET /api/users/:id
  // =====================
  test("GET /api/users/:id → returns user", async () => {
    sqlMock.mockResolvedValueOnce([
      { id: 1, name: "Alice", role: "Passenger" },
    ]);

    const res = await request(app).get("/api/users/1");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      id: 1,
      name: "Alice",
      role: "Passenger",
    });
  });

  test("GET /api/users/:id → 404 when not found", async () => {
    sqlMock.mockResolvedValueOnce([]);

    const res = await request(app).get("/api/users/99");

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      message: "User not found",
    });
  });

  // =====================
  // POST /api/users
  // =====================
  test("POST /api/users → creates user", async () => {
    sqlMock
      .mockResolvedValueOnce([]) // SELECT existing
      .mockResolvedValueOnce([
        { id: 3, name: "Charlie", role: "Passenger" },
      ]); // INSERT RETURNING

    hashMock.mockResolvedValue("hashed_pw");

    const res = await request(app)
      .post("/api/users")
      .send({
        name: "Charlie",
        password: "123456",
        role: "Passenger",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      id: 3,
      name: "Charlie",
      role: "Passenger",
    });
  });

  test("POST /api/users → 400 when missing fields", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({ name: "Charlie" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      message: "Name and password required",
    });
  });

  // =====================
  // DELETE /api/users/:id
  // =====================
  test("DELETE /api/users/:id → deletes user", async () => {
    sqlMock.mockResolvedValueOnce([{ id: 1 }]);

    const res = await request(app).delete("/api/users/1");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      message: "User deleted successfully",
    });
  });

  test("DELETE /api/users/:id → 404 when not found", async () => {
    sqlMock.mockResolvedValueOnce([]);

    const res = await request(app).delete("/api/users/99");

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      message: "User not found",
    });
  });
});
