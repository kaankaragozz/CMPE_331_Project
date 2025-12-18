import request from "supertest";
import { jest } from "@jest/globals";

const sqlMock = jest.fn();

jest.unstable_mockModule("../../config/db.js", () => ({
  sql: (...args) => sqlMock(...args),
}));

const app = (await import("../../server.js")).default;

describe("Cabin Crew Routes", () => {
  beforeEach(() => sqlMock.mockReset());

  test("GET /api/cabin-crew → returns list or 404", async () => {
    sqlMock.mockResolvedValueOnce([{ id: 1, first_name: "A" }]);

    const res = await request(app).get("/api/cabin-crew");

    expect(res.statusCode).toBe(200);
  });

  test("GET /api/cabin-crew/:id → returns 404 when not found", async () => {
    sqlMock.mockResolvedValueOnce([]);

    const res = await request(app).get("/api/cabin-crew/999");

    expect(res.statusCode).toBe(404);
  });

  test("POST /api/cabin-crew → creates cabin crew", async () => {
    sqlMock.mockResolvedValueOnce([{ id: 5, first_name: "A" }]);

    const res = await request(app).post("/api/cabin-crew").send({ first_name: "A", last_name: "B", age: 25, gender: "F", nationality: "TR", attendant_type_id: 1 });

    expect(res.statusCode).toBe(201);
  });
});
