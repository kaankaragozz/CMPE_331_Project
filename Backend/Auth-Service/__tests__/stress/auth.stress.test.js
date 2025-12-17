import request from "supertest";
import app from "../../server.js";

describe("Stress Test – Auth API", () => {

  test("System behavior under 150 concurrent logins (stress test)", async () => {
    const start = Date.now();

    const requests = Array.from({ length: 150 }).map(() =>
      request(app)
        .post("/api/auth/login")
        .send({
          name: "testuser",
          password: "123456"
        })
    );

    const responses = await Promise.allSettled(requests);
    const duration = Date.now() - start;

    const success = responses.filter(
      r => r.status === "fulfilled" && r.value.statusCode < 500
    ).length;

    console.log("Stress test completed in", duration, "ms");
    console.log("Successful responses:", success, "/", responses.length);

    expect(success).toBeGreaterThan(0); // system did not crash
  });

});