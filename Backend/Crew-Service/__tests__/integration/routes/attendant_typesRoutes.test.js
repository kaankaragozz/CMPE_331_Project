import request from "supertest";
import { jest } from "@jest/globals";

const sqlMock = jest.fn();

jest.unstable_mockModule("../../../config/db.js", () => ({
  sql: (...args) => sqlMock(...args),
}));

const app = (await import("../../../server.js")).default;

describe("Attendant Types Integration Routes", () => {
  beforeEach(() => sqlMock.mockReset());

  test("GET /api/attendant-types → returns list", async () => {
    sqlMock.mockResolvedValueOnce([{ id: 1, type_name: "chef" }]);

    const res = await request(app).get("/api/attendant-types");

    expect(res.statusCode).toBe(200);
  });
});
