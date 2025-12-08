import { sql } from "../../config/db.js";
import bcrypt from "bcryptjs";

// ✅ Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await sql`
      SELECT id, name, role, created_at 
      FROM users
      ORDER BY id DESC
    `;

    res.json(users);
  } catch (error) {
    console.error("getAllUsers error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get single user by ID
export const getUser = async (req, res) => {
  const { id } = req.params;

  try {
    const users = await sql`
      SELECT id, name, role, created_at 
      FROM users
      WHERE id = ${id}
    `;

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(users[0]);
  } catch (error) {
    console.error("getUser error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Create new user
export const createUser = async (req, res) => {
  const { name, password, role } = req.body;

  try {
    if (!name || !password) {
      return res.status(400).json({ message: "Name and password required" });
    }

    // Check if user exists
    const existing = await sql`
      SELECT id FROM users WHERE name = ${name}
    `;

    if (existing.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const newUser = await sql`
      INSERT INTO users (name, password, role)
      VALUES (${name}, ${hashedPassword}, ${role || 'Passenger'})
      RETURNING id, name, role, created_at
    `;

    res.status(201).json(newUser[0]);

  } catch (error) {
    console.error("createUser error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Delete user by ID
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await sql`
      DELETE FROM users
      WHERE id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("deleteUser error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
