import request from "supertest";
import app from "../../server.js"; // ✅ correct now   // server.js : Build Express app

describe("Auth Routes", () => {
  test("GET /health → 200", async () => {
    const res = await request(app).get("/health");

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("UP");
  });

  test("POST /api/auth/signup → 400 when empty", async () => {
    const res = await request(app).post("/api/auth/signup").send({});

    expect(res.statusCode).toBe(400);
  });

  test("POST /api/auth/login → 400 when empty", async () => {
    const res = await request(app).post("/api/auth/login").send({});

    expect(res.statusCode).toBe(400);
  });
});
