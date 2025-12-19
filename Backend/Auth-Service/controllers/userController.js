import { sql } from "../config/db.js";
import bcrypt from "bcryptjs";

// ✅ Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await sql`
      SELECT id, name, role, pilot_id, cabin_crew_id, passenger_id, created_at 
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
      SELECT id, name, role, pilot_id, cabin_crew_id, passenger_id, created_at, last_login
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
  const { name, password, role, pilot_id, cabin_crew_id, passenger_id } = req.body;

  try {
    if (!name || !password) {
      return res.status(400).json({ message: "Name and password required" });
    }

    const existing = await sql`
      SELECT id FROM users WHERE name = ${name}
    `;
    if (existing.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await sql`
      INSERT INTO users (name, password, role, pilot_id, cabin_crew_id, passenger_id)
      VALUES (${name}, ${hashedPassword}, ${role || 'Passenger'}, ${pilot_id ?? null}, ${cabin_crew_id ?? null}, ${passenger_id ?? null})
      RETURNING id, name, role, pilot_id, cabin_crew_id, passenger_id, created_at
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

// ✅ Update user (name, role, pilot_id)
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, role, pilot_id } = req.body;

  try {
    const updated = await sql`
      UPDATE users
      SET
        name = COALESCE(${name}, name),
        role = COALESCE(${role}, role),
        pilot_id = COALESCE(${pilot_id}, pilot_id),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, name, role, pilot_id, created_at, updated_at, last_login
    `;

    if (updated.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updated[0]);
  } catch (error) {
    console.error("updateUser error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

