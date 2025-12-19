import { sql } from "../config/db.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  const { name, password } = req.body;

  try {
    if (!name || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await sql`
      SELECT id FROM users WHERE name = ${name}
    `;

    if (user.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await sql`
      INSERT INTO users (name, password)
      VALUES (${name}, ${hashedPassword})
    `;

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  const { name, password } = req.body;

  try {
    if (!name || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await sql`
      SELECT id, name, password, role, pilot_id, cabin_crew_id
      FROM users
      WHERE name = ${name}
    `;

    if (user.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const valid = await bcrypt.compare(password, user[0].password);
    if (!valid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    await sql`
      UPDATE users SET last_login = NOW() WHERE id = ${user[0].id}
    `;

    res.json({
      message: "Login successful",
      user: {
        id: user[0].id,
        name: user[0].name,
        role: user[0].role,
        pilot_id: user[0].pilot_id, // 🔑 new
        cabin_crew_id: user[0].cabin_crew_id, // 🔑 new
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
