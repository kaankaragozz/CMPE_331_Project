import request from "supertest";
import { jest } from "@jest/globals";

const sqlMock = jest.fn();

jest.unstable_mockModule("../../../config/db.js", () => ({
  sql: (...args) => sqlMock(...args),
}));

const app = (await import("../../../server.js")).default;

describe("Pilots Integration Routes", () => {
  beforeEach(() => sqlMock.mockReset());

  test("GET /api/pilots → returns pilots", async () => {
    sqlMock.mockResolvedValueOnce([{ id: 1, name: "John" }]);

    const res = await request(app).get("/api/pilots");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
