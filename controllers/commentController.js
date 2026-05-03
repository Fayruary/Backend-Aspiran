import db from "../config/db.js";

// ─────────────────────────────
// CREATE COMMENT
// ─────────────────────────────
export const addComment = async (req, res) => {
  try {
    const { comment, laporan_id } = req.body;

    if (!comment || !laporan_id) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    await db.query(
      "INSERT INTO comments (comment, user_id, laporan_id) VALUES (?, ?, ?)",
      [comment, req.user.id, laporan_id]
    );

    res.json({ message: "Komentar berhasil ditambahkan" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─────────────────────────────
// READ COMMENTS BY LAPORAN
// ─────────────────────────────
export const getComments = async (req, res) => {
  try {
    const [data] = await db.query(
      `SELECT c.*, u.username
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.laporan_id = ?
       ORDER BY c.created_at ASC`,
      [req.params.laporan_id]
    );

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─────────────────────────────
// UPDATE COMMENT
// ─────────────────────────────
export const updateComment = async (req, res) => {
  try {
    const { comment } = req.body;
    const { id } = req.params;

    // cek kepemilikan komentar
    const [rows] = await db.query(
      "SELECT * FROM comments WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Komentar tidak ditemukan" });
    }

    const data = rows[0];

    // hanya pemilik atau admin/superadmin yang boleh edit
    if (data.user_id !== req.user.id && !["admin", "superadmin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Tidak diizinkan" });
    }

    await db.query(
      "UPDATE comments SET comment = ? WHERE id = ?",
      [comment, id]
    );

    res.json({ message: "Komentar berhasil diupdate" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─────────────────────────────
// DELETE COMMENT
// ─────────────────────────────
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      "SELECT * FROM comments WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Komentar tidak ditemukan" });
    }

    const data = rows[0];

    // hanya pemilik atau admin/superadmin
    if (data.user_id !== req.user.id && !["admin", "superadmin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Tidak diizinkan" });
    }

    await db.query("DELETE FROM comments WHERE id = ?", [id]);

    res.json({ message: "Komentar berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};