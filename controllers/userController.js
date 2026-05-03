import db from "../config/db.js";
import bcrypt from "bcrypt";

// ─────────────────────────────
// CREATE USER (SUPERADMIN ONLY)
// ─────────────────────────────
export const createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Akses ditolak" });
    }

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

// ─────────────────────────────
// READ ALL USERS (SUPERADMIN ONLY)
// ─────────────────────────────
export const getUsers = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    const [data] = await db.query(
      "SELECT id, username, email, role, created_at FROM users"
    );

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─────────────────────────────
// READ USER BY ID
// ─────────────────────────────
export const getUserById = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    const [data] = await db.query(
      "SELECT id, username, email, role FROM users WHERE id = ?",
      [req.params.id]
    );

    if (data.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─────────────────────────────
// UPDATE USER
// ─────────────────────────────
export const updateUser = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    const { username, email, role } = req.body;

    await db.query(
      "UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?",
      [username, email, role, req.params.id]
    );

    res.json({ message: "User berhasil diupdate" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─────────────────────────────
// DELETE USER
// ─────────────────────────────
export const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    await db.query("DELETE FROM users WHERE id = ?", [req.params.id]);

    res.json({ message: "User berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};