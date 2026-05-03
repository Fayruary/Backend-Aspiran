import db from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// REGISTER
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // cek email sudah dipakai
    const [cek] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (cek.length > 0) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    // hash password
    const hash = await bcrypt.hash(password, 10);

    // INSERT dengan role jelas
    await db.query(
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
      [username, email, hash, "user"]
    );

    res.json({ message: "Register berhasil" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0)
      return res.status(404).json({ message: "User tidak ditemukan" });

    const user = users[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match)
      return res.status(401).json({ message: "Password salah" });

   const token = jwt.sign(
  {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);

    res.json({
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};