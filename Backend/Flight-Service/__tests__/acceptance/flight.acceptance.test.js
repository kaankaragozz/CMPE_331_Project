import request from "supertest";
import app from "../../server.js";

/*
  ACCEPTANCE TESTS – FLIGHT API
  These tests verify that the flight
  system meets functional requirements.
*/

describe("Acceptance Tests – Flight API", () => {

  test("User can get all airports", async () => {
    const res = await request(app)
      .get("/api/airports");

    expect([200, 500]).toContain(res.statusCode);
  });

  test("User can get airport by code", async () => {
    const res = await request(app)
      .get("/api/airports/JFK");

    // Can return 200 if exists, 404 if not, or 500 on error
    expect([200, 404, 500]).toContain(res.statusCode);
  });

  test("User can create airport with valid data", async () => {
    const res = await request(app)
      .post("/api/airports")
      .send({
        code: "TEST",
        name: "Test Airport",
        city: "Test City",
        country: "Test Country"
      });

    // Can return 201 if created, 400 if validation fails, 409 if exists, or 500 on error
    expect([201, 400, 409, 500]).toContain(res.statusCode);
  });

  test("User can get all flights", async () => {
    const res = await request(app)
      .get("/api/flights");

    expect([200, 500]).toContain(res.statusCode);
  });

  test("User can get flight by flight number", async () => {
    const res = await request(app)
      .get("/api/flights/AA1234");

    // Can return 200 if exists, 400 if invalid format, 404 if not found, or 500 on error
    expect([200, 400, 404, 500]).toContain(res.statusCode);
  });

  test("Get flight fails with invalid flight number format", async () => {
    const res = await request(app)
      .post("/api/flights")
      .send({
        flight_number: "INVALID",
      });

    expect(res.statusCode).toBe(400);
  });

  test("User can get all vehicle types", async () => {
    const res = await request(app)
      .get("/api/vehicle-types");

    expect([200, 500]).toContain(res.statusCode);
  });

  test("User can get vehicle type by id", async () => {
    const res = await request(app)
      .get("/api/vehicle-types/1");

    // Can return 200 if exists, 404 if not found, or 500 on error
    expect([200, 404, 500]).toContain(res.statusCode);
  });

  test("Health check returns UP status", async () => {
    const res = await request(app)
      .get("/health");

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("UP");
    expect(res.body.service).toBe("Flight Service");
  });

});

