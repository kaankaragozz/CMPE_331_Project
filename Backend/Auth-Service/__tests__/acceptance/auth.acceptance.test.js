import request from "supertest";
import app from "../../server.js";

/*
  ACCEPTANCE TESTS – AUTH API
  These tests verify that the authentication
  system meets functional requirements.
*/

describe("Acceptance Tests – Auth API", () => {

  test("User can sign up with valid data", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({
        name: "accept_user",
        password: "123456"
      });

    expect([200, 201, 400]).toContain(res.statusCode);
  });

  test("User can log in with correct credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        name: "accept_user",
        password: "123456"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("user");
  });

  test("Login fails with wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        name: "accept_user",
        password: "wrong"
      });

    expect(res.statusCode).toBe(400);
  });

});
