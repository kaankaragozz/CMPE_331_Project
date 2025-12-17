import request from "supertest";
import app from "../../server.js";

/*
  SECURITY TESTS – AUTH API
  These tests verify that the backend is resistant
  to common security threats such as SQL injection,
  authentication bypass, and invalid input.
*/

describe("Security Tests – Auth API", () => {

  /*
    TC-SEC-01:
    SQL Injection attempt during login
    Expected:
    The system must reject malicious SQL input
  */
  test("Reject SQL injection on login", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        name: "' OR '1'='1",
        password: "' OR '1'='1"
      });

    // Your controller returns 400 for invalid login
    expect(res.statusCode).toBe(400);
  });

  /*
    TC-SEC-02:
    Authentication bypass attempt
    Expected:
    Login without password should be rejected
  */
  test("Reject login without password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ name: "testuser" });

    expect(res.statusCode).toBe(400);
  });

  /*
    TC-SEC-03:
    Invalid credentials
    Expected:
    Login must fail when password is incorrect
  */
  test("Reject login with wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        name: "testuser",
        password: "wrongpassword"
      });

    expect(res.statusCode).toBe(400);
  });

  /*
    TC-SEC-04:
    XSS / Script Injection
    Expected:
    Script tags should not be accepted as input
  */

  /*
   test("Reject XSS input on signup", async () => {
     const res = await request(app)
       .post("/api/auth/signup")
       .send({
         name: "<script>alert('xss')</script>",
         password: "123456"
       });
 
     // Validation or server-side rejection
     expect([400, 500]).toContain(res.statusCode);
   });*/

  /*
    TC-SEC-05:
    HTTP Method misuse
    Expected:
    GET requests to POST-only endpoint must fail
  */
  test("Reject wrong HTTP method", async () => {
    const res = await request(app).get("/api/auth/login");
    expect(res.statusCode).toBe(404);
  });

});
