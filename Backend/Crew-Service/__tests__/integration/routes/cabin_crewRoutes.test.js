import request from "supertest";
import { jest } from "@jest/globals";

const sqlMock = jest.fn();

jest.unstable_mockModule("../../../config/db.js", () => ({
  sql: (...args) => sqlMock(...args),
}));

const app = (await import("../../../server.js")).default;

describe("Cabin Crew Integration Routes", () => {
  beforeEach(() => sqlMock.mockReset());

  test("GET /api/cabin-crew → returns list", async () => {
    sqlMock.mockResolvedValueOnce([{ id: 1, first_name: "A" }]);

    const res = await request(app).get("/api/cabin-crew");

    expect(res.statusCode).toBe(200);
  });
});
