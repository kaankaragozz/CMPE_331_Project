import request from "supertest";
import app from "../../server.js";

describe("Performance Tests – Flight API", () => {

  // =====================
  // GET /api/airports
  // =====================
  test("GET /api/airports response time < 1s", async () => {
    const start = Date.now();

    const res = await request(app)
      .get("/api/airports");

    const duration = Date.now() - start;

    console.log("GET /api/airports response time:", duration, "ms");

    expect(res.statusCode).toBeLessThan(500);
    expect(duration).toBeLessThan(1000);
  });

  test("Handle 20 concurrent GET /api/airports requests", async () => {
    const start = Date.now();

    const requests = Array.from({ length: 20 }).map(() =>
      request(app)
        .get("/api/airports")
    );

    const responses = await Promise.all(requests);
    const duration = Date.now() - start;

    responses.forEach(res => {
      expect(res.statusCode).toBeLessThan(500);
    });

    console.log("20 GET /api/airports requests completed in:", duration, "ms");

    expect(duration).toBeLessThan(3000);
  });

  // =====================
  // GET /api/flights
  // =====================
  test("GET /api/flights response time < 1s", async () => {
    const start = Date.now();

    const res = await request(app)
      .get("/api/flights");

    const duration = Date.now() - start;

    console.log("GET /api/flights response time:", duration, "ms");

    expect(res.statusCode).toBeLessThan(500);
    expect(duration).toBeLessThan(1000);
  });

  test("Handle 20 concurrent GET /api/flights requests", async () => {
    const start = Date.now();

    const requests = Array.from({ length: 20 }).map(() =>
      request(app)
        .get("/api/flights")
    );

    const responses = await Promise.all(requests);
    const duration = Date.now() - start;

    responses.forEach(res => {
      expect(res.statusCode).toBeLessThan(500);
    });

    console.log("20 GET /api/flights requests completed in:", duration, "ms");

    expect(duration).toBeLessThan(3000);
  });

  // =====================
  // GET /api/vehicle-types
  // =====================
  test("GET /api/vehicle-types response time < 1s", async () => {
    const start = Date.now();

    const res = await request(app)
      .get("/api/vehicle-types");

    const duration = Date.now() - start;

    console.log("GET /api/vehicle-types response time:", duration, "ms");

    expect(res.statusCode).toBeLessThan(500);
    expect(duration).toBeLessThan(1000);
  });

  test("Handle 20 concurrent GET /api/vehicle-types requests", async () => {
    const start = Date.now();

    const requests = Array.from({ length: 20 }).map(() =>
      request(app)
        .get("/api/vehicle-types")
    );

    const responses = await Promise.all(requests);
    const duration = Date.now() - start;

    responses.forEach(res => {
      expect(res.statusCode).toBeLessThan(500);
    });

    console.log("20 GET /api/vehicle-types requests completed in:", duration, "ms");

    expect(duration).toBeLessThan(3000);
  });

  // =====================
  // GET /health
  // =====================
  test("GET /health response time < 100ms", async () => {
    const start = Date.now();

    const res = await request(app)
      .get("/health");

    const duration = Date.now() - start;

    console.log("GET /health response time:", duration, "ms");

    expect(res.statusCode).toBeLessThan(500);
    expect(duration).toBeLessThan(100);
  });

  test("Handle 50 concurrent GET /health requests", async () => {
    const start = Date.now();

    const requests = Array.from({ length: 50 }).map(() =>
      request(app)
        .get("/health")
    );

    const responses = await Promise.all(requests);
    const duration = Date.now() - start;

    responses.forEach(res => {
      expect(res.statusCode).toBeLessThan(500);
    });

    console.log("50 GET /health requests completed in:", duration, "ms");

    expect(duration).toBeLessThan(1000);
  });

  // =====================
  // GET /api/airports/:code
  // =====================
  test("GET /api/airports/:code response time < 1s", async () => {
    const start = Date.now();

    const res = await request(app)
      .get("/api/airports/JFK");

    const duration = Date.now() - start;

    console.log("GET /api/airports/:code response time:", duration, "ms");

    expect(res.statusCode).toBeLessThan(500);
    expect(duration).toBeLessThan(1000);
  });

  // =====================
  // GET /api/flights/:flight_number
  // =====================
  test("GET /api/flights/:flight_number response time < 1s", async () => {
    const start = Date.now();

    const res = await request(app)
      .get("/api/flights/AA1234");

    const duration = Date.now() - start;

    console.log("GET /api/flights/:flight_number response time:", duration, "ms");

    expect(res.statusCode).toBeLessThan(500);
    expect(duration).toBeLessThan(1000);
  });

  // =====================
  // GET /api/vehicle-types/:id
  // =====================
  test("GET /api/vehicle-types/:id response time < 1s", async () => {
    const start = Date.now();

    const res = await request(app)
      .get("/api/vehicle-types/1");

    const duration = Date.now() - start;

    console.log("GET /api/vehicle-types/:id response time:", duration, "ms");

    expect(res.statusCode).toBeLessThan(500);
    expect(duration).toBeLessThan(1000);
  });

});

