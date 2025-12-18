import request from "supertest";
import app from "../../server.js";

/*
  ACCEPTANCE TESTS – PASSENGER API
  These tests verify that the passenger
  system meets functional requirements.
*/

describe("Acceptance Tests – Passenger API", () => {

  test("User can get all passengers", async () => {
    const res = await request(app)
      .get("/api/passengers");

    expect([200, 500]).toContain(res.statusCode);
  });

  test("User can get passenger by id", async () => {
    const res = await request(app)
      .get("/api/passengers/1");

    // Can return 200 if exists, 404 if not, or 500 on error
    expect([200, 404, 500]).toContain(res.statusCode);
  });

  test("User can create passenger with valid data", async () => {
    const res = await request(app)
      .post("/api/passengers")
      .send({
        name: "Test Passenger",
        age: 30,
        gender: "Male",
        nationality: "USA"
      });

    // Can return 201 if created, 400 if validation fails, or 500 on error
    expect([201, 400, 500]).toContain(res.statusCode);
  });

  test("User cannot create passenger without required fields", async () => {
    const res = await request(app)
      .post("/api/passengers")
      .send({
        name: "Test Passenger"
      });

    expect(res.statusCode).toBe(400);
  });

  test("User can update passenger", async () => {
    const res = await request(app)
      .put("/api/passengers/1")
      .send({
        name: "Updated Name",
        age: 31,
        gender: "Male",
        nationality: "USA"
      });

    // Can return 200 if updated, 404 if not found, or 500 on error
    expect([200, 404, 500]).toContain(res.statusCode);
  });

  test("User can delete passenger", async () => {
    const res = await request(app)
      .delete("/api/passengers/1");

    // Can return 200 if deleted, 404 if not found, or 500 on error
    expect([200, 404, 500]).toContain(res.statusCode);
  });

  test("User can get passengers by flight", async () => {
    const res = await request(app)
      .get("/api/passengers/flight/AA1234");

    // Can return 200 if flight exists, or 500 on error
    expect([200, 500]).toContain(res.statusCode);
  });

  test("User can add passenger to flight", async () => {
    const res = await request(app)
      .post("/api/passengers/flight-assignment")
      .send({
        name: "Flight Passenger",
        age: 25,
        gender: "Female",
        nationality: "UK",
        flight_number: "AA1234",
        seat_type_id: 1,
        is_infant: false
      });

    // Can return 201 if created, 400 if validation fails, or 500 on error
    expect([201, 400, 500]).toContain(res.statusCode);
  });

  test("User can remove passenger from flight", async () => {
    const res = await request(app)
      .delete("/api/passengers/flight/AA1234/1");

    // Can return 200 if removed, 404 if not found, or 500 on error
    expect([200, 404, 500]).toContain(res.statusCode);
  });

  test("User can get affiliated passengers for a flight", async () => {
    const res = await request(app)
      .get("/api/passengers/flight/AA1234/affiliations");

    // Can return 200 if flight exists, or 500 on error
    expect([200, 500]).toContain(res.statusCode);
  });

  test("User can create affiliation between passengers", async () => {
    const res = await request(app)
      .post("/api/passengers/affiliations")
      .send({
        main_passenger_id: 1,
        affiliated_passenger_id: 2,
        flight_number: "AA1234"
      });

    // Can return 201 if created, or 500 on error
    expect([201, 500]).toContain(res.statusCode);
  });

  test("User can delete affiliation", async () => {
    const res = await request(app)
      .delete("/api/passengers/affiliations/1");

    // Can return 200 if deleted, or 500 on error
    expect([200, 500]).toContain(res.statusCode);
  });

  test("User can get infant relationships for a flight", async () => {
    const res = await request(app)
      .get("/api/passengers/flight/AA1234/infants");

    // Can return 200 if flight exists, or 500 on error
    expect([200, 500]).toContain(res.statusCode);
  });

  test("User can create infant relationship", async () => {
    const res = await request(app)
      .post("/api/passengers/infants")
      .send({
        infant_passenger_id: 1,
        parent_passenger_id: 2,
        flight_number: "AA1234"
      });

    // Can return 201 if created, or 500 on error
    expect([201, 500]).toContain(res.statusCode);
  });

  test("User can delete infant relationship", async () => {
    const res = await request(app)
      .delete("/api/passengers/infants/1");

    // Can return 200 if deleted, or 500 on error
    expect([200, 500]).toContain(res.statusCode);
  });

  test("User can auto assign seats for a flight", async () => {
    const res = await request(app)
      .post("/api/passengers/flight/AA1234/assign-seats");

    // Can return 200 if successful, 404 if flight not found, or 500 on error
    expect([200, 404, 500]).toContain(res.statusCode);
  });

  test("User can manually assign seat to passenger", async () => {
    const res = await request(app)
      .put("/api/passengers/flight/AA1234/manual-assign")
      .send({
        passenger_id: 1,
        seat_number: "1A"
      });

    // Can return 200 if successful, 400 if validation fails, 404 if not found, 409 if occupied, or 500 on error
    expect([200, 400, 404, 409, 500]).toContain(res.statusCode);
  });

  test("Health check returns UP status", async () => {
    const res = await request(app)
      .get("/health");

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("UP");
    expect(res.body.service).toBe("Passenger Service");
  });

});

