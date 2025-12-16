import { jest } from "@jest/globals";

/* =====================
   MOCK sql (ESM)
===================== */
const sqlMock = jest.fn();

jest.unstable_mockModule("../../config/db.js", () => ({
  sql: (...args) => sqlMock(...args),
}));

/* =====================
   MOCK bcrypt (ESM default export)
===================== */
const hashMock = jest.fn();

jest.unstable_mockModule("bcryptjs", () => ({
  default: {
    hash: hashMock,
  },
}));

/* =====================
   IMPORT CONTROLLER AFTER MOCKS
===================== */
const {
  getAllUsers,
  getUser,
  createUser,
  deleteUser,
} = await import("../../controllers/userController.js");

describe("User Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    sqlMock.mockReset();
    hashMock.mockReset();
  });

  // =====================
  // GET ALL USERS
  // =====================
  test("getAllUsers → returns list of users", async () => {
    sqlMock.mockResolvedValueOnce([
      { id: 2, name: "Bob", role: "Admin", created_at: "2024-01-01" },
      { id: 1, name: "Alice", role: "Passenger", created_at: "2023-12-01" },
    ]);

    await getAllUsers(req, res);

    expect(res.json).toHaveBeenCalledWith([
      { id: 2, name: "Bob", role: "Admin", created_at: "2024-01-01" },
      { id: 1, name: "Alice", role: "Passenger", created_at: "2023-12-01" },
    ]);
  });

  // =====================
  // GET USER BY ID
  // =====================
  test("getUser → returns user when found", async () => {
    req.params.id = "1";

    sqlMock.mockResolvedValueOnce([
      { id: 1, name: "Alice", role: "Passenger", created_at: "2023-12-01" },
    ]);

    await getUser(req, res);

    expect(res.json).toHaveBeenCalledWith({
      id: 1,
      name: "Alice",
      role: "Passenger",
      created_at: "2023-12-01",
    });
  });

  test("getUser → returns 404 when user not found", async () => {
    req.params.id = "99";

    sqlMock.mockResolvedValueOnce([]);

    await getUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "User not found",
    });
  });

  // =====================
  // CREATE USER
  // =====================
  test("createUser → returns 201 with new user", async () => {
    req.body = {
      name: "Charlie",
      password: "123456",
      role: "Passenger",
    };

    sqlMock.mockResolvedValueOnce([]); // SELECT existing user
    hashMock.mockResolvedValue("hashed_pw");
    sqlMock.mockResolvedValueOnce([
      {
        id: 3,
        name: "Charlie",
        role: "Passenger",
        created_at: "2024-02-01",
      },
    ]); // INSERT RETURNING

    await createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      id: 3,
      name: "Charlie",
      role: "Passenger",
      created_at: "2024-02-01",
    });
  });

  test("createUser → returns 400 when name or password missing", async () => {
    req.body = { name: "Charlie" };

    await createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Name and password required",
    });
  });

  test("createUser → returns 400 when user already exists", async () => {
    req.body = {
      name: "Alice",
      password: "123456",
    };

    sqlMock.mockResolvedValueOnce([{ id: 1 }]); // existing user

    await createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "User already exists",
    });
  });

  // =====================
  // DELETE USER
  // =====================
  test("deleteUser → deletes user successfully", async () => {
    req.params.id = "1";

    sqlMock.mockResolvedValueOnce([{ id: 1 }]);

    await deleteUser(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "User deleted successfully",
    });
  });

  test("deleteUser → returns 404 when user not found", async () => {
    req.params.id = "99";

    sqlMock.mockResolvedValueOnce([]);

    await deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "User not found",
    });
  });
});
