import { sql } from "../../config/db.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  const { name, password } = req.body;

  try {
    if (!name || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user exists
    const user = await sql`
      SELECT id FROM users WHERE name = ${name}
    `;

    if (user.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
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

    // Find user (include role)
    const user = await sql`
      SELECT id, name, password, role
      FROM users
      WHERE name = ${name}
    `;

    if (user.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    // Compare password
    const valid = await bcrypt.compare(password, user[0].password);

    if (!valid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Update last_login
    await sql`
      UPDATE users SET last_login = NOW() WHERE id = ${user[0].id}
    `;

    // ✅ Include role in response
    res.json({
      message: "Login successful",
      user: {
        id: user[0].id,
        name: user[0].name,
        role: user[0].role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};