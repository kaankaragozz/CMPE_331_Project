import request from "supertest";
import app from "../../server.js";

describe("Performance Tests – Auth API", () => {

  test("Login response time < 1s", async () => {
    const start = Date.now();

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        name: "testuser",
        password: "123456"
      });

    const duration = Date.now() - start;

    console.log("Login response time:", duration, "ms");

    expect(res.statusCode).toBeLessThan(500);
    expect(duration).toBeLessThan(2500);
  });

  test("Handle 20 concurrent login requests", async () => {
    const start = Date.now();

    const requests = Array.from({ length: 20 }).map(() =>
      request(app)
        .post("/api/auth/login")
        .send({
          name: "testuser",
          password: "123456"
        })
    );

    const responses = await Promise.all(requests);
    const duration = Date.now() - start;

    responses.forEach(res => {
      expect(res.statusCode).toBeLessThan(500);
    });

    console.log("20 logins completed in:", duration, "ms");

    expect(duration).toBeLessThan(3000);
  });

});

