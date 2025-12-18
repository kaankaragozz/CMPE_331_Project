import request from "supertest";
import { jest } from "@jest/globals";

const sqlMock = jest.fn();
jest.unstable_mockModule("../../config/db.js", () => ({ sql: (...args) => sqlMock(...args) }));
// Provide a sensible default for DB queries so controllers receive an array
// and don't encounter `Cannot read properties of undefined (reading 'length')`.
sqlMock.mockResolvedValue([]);
const app = (await import("../../server.js")).default;

describe("Performance Tests – Crew API", () => {
  test("GET /api/pilots response time < 1s", async () => {
    const start = Date.now();
    const res = await request(app).get("/api/pilots");
    const duration = Date.now() - start;
    expect(res.statusCode).toBeLessThan(500);
    expect(duration).toBeLessThan(1000);
  });

  test("Handle 20 concurrent GET /api/pilots requests", async () => {
    const start = Date.now();
    const requests = Array.from({ length: 20 }).map(() => request(app).get("/api/pilots"));
    const responses = await Promise.all(requests);
    const duration = Date.now() - start;
    responses.forEach(res => expect(res.statusCode).toBeLessThan(500));
    expect(duration).toBeLessThan(3000);
  });

  test("GET /health response time < 100ms", async () => {
    const start = Date.now();
    const res = await request(app).get("/health");
    const duration = Date.now() - start;
    expect(res.statusCode).toBeLessThan(500);
    expect(duration).toBeLessThan(100);
  });
});
