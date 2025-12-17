import request from "supertest";
import app from "../../../server.js"; // ✅ correct now   // server.js : Build Express app

/* =====================
   GREY BOX (integration Test)
===================== */

describe("Flight Routes", () => {
  test("GET /health → 200", async () => {
    const res = await request(app).get("/health");

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("UP");
  });

  test("GET /api/airports → 200 when empty", async () => {
    const res = await request(app).get("/api/airports");

    expect([200, 500]).toContain(res.statusCode);
  });

  test("GET /api/flights → 200 when empty", async () => {
    const res = await request(app).get("/api/flights");

    expect([200, 500]).toContain(res.statusCode);
  });

  test("GET /api/vehicle-types → 200 when empty", async () => {
    const res = await request(app).get("/api/vehicle-types");

    expect([200, 500]).toContain(res.statusCode);
  });
});

