import request from "supertest";
import app from "../../server.js";

describe("Performance Tests – Passenger API", () => {

  // =====================
  // GET /api/passengers
  // =====================
  test("GET /api/passengers response time < 1s", async () => {
    const start = Date.now();

    const res = await request(app)
      .get("/api/passengers");

    const duration = Date.now() - start;

    console.log("GET /api/passengers response time:", duration, "ms");

    expect(res.statusCode).toBeLessThan(500);
    expect(duration).toBeLessThan(1000);
  });

  test("Handle 20 concurrent GET /api/passengers requests", async () => {
    const start = Date.now();

    const requests = Array.from({ length: 20 }).map(() =>
      request(app)
        .get("/api/passengers")
    );

    const responses = await Promise.all(requests);
    const duration = Date.now() - start;

    responses.forEach(res => {
      expect(res.statusCode).toBeLessThan(500);
    });

    console.log("20 GET /api/passengers requests completed in:", duration, "ms");

    expect(duration).toBeLessThan(3000);
  });

  // =====================
  // GET /api/passengers/:id
  // =====================
  test("GET /api/passengers/:id response time < 1s", async () => {
    const start = Date.now();

    const res = await request(app)
      .get("/api/passengers/1");

    const duration = Date.now() - start;

    console.log("GET /api/passengers/:id response time:", duration, "ms");

    expect(res.statusCode).toBeLessThan(500);
    expect(duration).toBeLessThan(1000);
  });

  // =====================
  // GET /api/passengers/flight/:flight_number
  // =====================
  test("GET /api/passengers/flight/:flight_number response time < 1s", async () => {
    const start = Date.now();

    const res = await request(app)
      .get("/api/passengers/flight/AA1234");

    const duration = Date.now() - start;

    console.log("GET /api/passengers/flight/:flight_number response time:", duration, "ms");

    expect(res.statusCode).toBeLessThan(500);
    expect(duration).toBeLessThan(1000);
  });

  test("Handle 20 concurrent GET /api/passengers/flight/:flight_number requests", async () => {
    const start = Date.now();

    const requests = Array.from({ length: 20 }).map(() =>
      request(app)
        .get("/api/passengers/flight/AA1234")
    );

    const responses = await Promise.all(requests);
    const duration = Date.now() - start;

    responses.forEach(res => {
      expect(res.statusCode).toBeLessThan(500);
    });

    console.log("20 GET /api/passengers/flight/:flight_number requests completed in:", duration, "ms");

    expect(duration).toBeLessThan(3000);
  });

  // =====================
  // GET /api/passengers/flight/:flight_number/affiliations
  // =====================
  test("GET /api/passengers/flight/:flight_number/affiliations response time < 1s", async () => {
    const start = Date.now();

    const res = await request(app)
      .get("/api/passengers/flight/AA1234/affiliations");

    const duration = Date.now() - start;

    console.log("GET /api/passengers/flight/:flight_number/affiliations response time:", duration, "ms");

    expect(res.statusCode).toBeLessThan(500);
    expect(duration).toBeLessThan(1000);
  });

  // =====================
  // GET /api/passengers/flight/:flight_number/infants
  // =====================
  test("GET /api/passengers/flight/:flight_number/infants response time < 1s", async () => {
    const start = Date.now();

    const res = await request(app)
      .get("/api/passengers/flight/AA1234/infants");

    const duration = Date.now() - start;

    console.log("GET /api/passengers/flight/:flight_number/infants response time:", duration, "ms");

    expect(res.statusCode).toBeLessThan(500);
    expect(duration).toBeLessThan(1000);
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

});

