import { jest } from "@jest/globals";

const sqlMock = jest.fn();

jest.unstable_mockModule("../../config/db.js", () => ({
  sql: (...args) => sqlMock(...args),
}));

const {
  getAllCabinCrew,
  getCabinCrew,
  createCabinCrew,
  updateCabinCrew,
  deleteCabinCrew,
} = await import("../../controllers/cabin_crewController.js");

describe("Cabin Crew Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    sqlMock.mockReset();
  });

  test("getAllCabinCrew → returns list", async () => {
    const mock = [{ id: 1, first_name: "A", last_name: "B" }];
    sqlMock.mockResolvedValueOnce(mock);

    await getAllCabinCrew(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mock }));
  });

  test("getAllCabinCrew → returns 404 when none", async () => {
    sqlMock.mockResolvedValueOnce([]);

    await getAllCabinCrew(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "No cabin crew found" });
  });

  test("getCabinCrew → returns crew by id", async () => {
    req.params.id = "1";
    sqlMock.mockResolvedValueOnce([{ id: 1, first_name: "A" }]);

    await getCabinCrew(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  test("getCabinCrew → 404 when not found", async () => {
    req.params.id = "99";
    sqlMock.mockResolvedValueOnce([]);

    await getCabinCrew(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Cabin crew not found" });
  });

  test("createCabinCrew → returns 201 with created", async () => {
    req.body = { first_name: "A", last_name: "B", age: 30, gender: "F", nationality: "TR", attendant_type_id: 1 };
    sqlMock.mockResolvedValueOnce([{ id: 10, first_name: "A" }]);

    await createCabinCrew(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: { id: 10, first_name: "A" } }));
  });

  test("updateCabinCrew → returns 200 with updated", async () => {
    req.params.id = "1";
    req.body = { first_name: "Updated" };
    sqlMock.mockResolvedValueOnce([{ id: 1 }]);

    await updateCabinCrew(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  test("deleteCabinCrew → deletes successfully", async () => {
    req.params.id = "1";
    sqlMock.mockResolvedValueOnce({});

    await deleteCabinCrew(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: "Cabin crew deleted successfully" });
  });
});
