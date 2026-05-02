import db from "../config/db.js";
import bcrypt from "bcrypt";

// CREATE USER (SUPERADMIN)
export const createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const hash = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
      [username, email, hash, role]
    );

    res.json({ message: "User berhasil dibuat" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ALL USER
export const getUsers = async (req, res) => {
  const [data] = await db.query(
    "SELECT id, username, email, role FROM users"
  );

  res.json(data);
};