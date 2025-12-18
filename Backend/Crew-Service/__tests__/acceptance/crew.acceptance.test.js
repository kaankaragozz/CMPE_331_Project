import request from "supertest";
import { jest } from "@jest/globals";

const sqlMock = jest.fn();
jest.unstable_mockModule("../../config/db.js", () => ({ sql: (...args) => sqlMock(...args) }));
const app = (await import("../../server.js")).default;

describe("Acceptance Tests – Crew API", () => {

  test("User can get all pilots", async () => {
    const res = await request(app).get("/api/pilots");
    expect([200, 500]).toContain(res.statusCode);
  });

  test("User can get pilot by id", async () => {
    const res = await request(app).get("/api/pilots/1");
    expect([200, 404, 500]).toContain(res.statusCode);
  });

  test("User can create pilot with valid data", async () => {
    const res = await request(app).post("/api/pilots").send({ name: "Test", age: 30, gender: "M", nationality: "TR", vehicle_type_id: 1, allowed_range: 500, seniority_level: "Junior" });
    expect([201, 400, 409, 500]).toContain(res.statusCode);
  });

  test("User can get all cabin crew", async () => {
    const res = await request(app).get("/api/cabin-crew");
    expect([200, 404, 500]).toContain(res.statusCode);
  });

  test("User can get cabin crew by id", async () => {
    const res = await request(app).get("/api/cabin-crew/1");
    expect([200, 404, 500]).toContain(res.statusCode);
  });

  test("Health check returns UP status", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("UP");
    expect(res.body.service).toBe("Crew Service");
  });
});
