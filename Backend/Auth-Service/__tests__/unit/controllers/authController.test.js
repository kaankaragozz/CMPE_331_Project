import { jest } from "@jest/globals";

/* =====================
   WHITE BOX (UNIT TEST)
===================== */

/* =====================
   MOCK sql (ESM)
===================== */
const sqlMock = jest.fn();

jest.unstable_mockModule("../../../config/db.js", () => ({
  sql: (...args) => sqlMock(...args),
}));

/* =====================
   MOCK bcrypt (ESM DEFAULT EXPORT)
===================== */
const hashMock = jest.fn();
const compareMock = jest.fn();

jest.unstable_mockModule("bcryptjs", () => ({
  default: {
    hash: hashMock,
    compare: compareMock,
  },
}));

/* =====================
   IMPORT AFTER ALL MOCKS
===================== */
const { signup, login } = await import("../../../controllers/authController.js");

describe("Auth Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    sqlMock.mockReset();
    hashMock.mockReset();
    compareMock.mockReset();
  });

  // =====================
  // SIGNUP
  // =====================
  test("signup → returns 201", async () => {
    req.body = { name: "testuser", password: "123456" };

    sqlMock.mockResolvedValueOnce([]);   // SELECT
    hashMock.mockResolvedValue("hashed");
    sqlMock.mockResolvedValueOnce({});   // INSERT

    await signup(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "User created successfully",
    });
  });

  // =====================
  // LOGIN
  // =====================
  test("login → returns user data", async () => {
    req.body = { name: "testuser", password: "123456" };

    sqlMock.mockResolvedValueOnce([
      {
        id: 1,
        name: "testuser",
        password: "hashed",
        role: "Passenger",
      },
    ]);

    compareMock.mockResolvedValue(true);
    sqlMock.mockResolvedValueOnce({}); // UPDATE

    await login(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Login successful",
      user: {
        id: 1,
        name: "testuser",
        role: "Passenger",
      },
    });
  });
});
