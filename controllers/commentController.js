import db from "../config/db.js";

// tambah komentar
export const addComment = async (req, res) => {
  try {
    const { comment, laporan_id } = req.body;

    await db.query(
      "INSERT INTO comments (comment, user_id, laporan_id) VALUES (?, ?, ?)",
      [comment, req.user.id, laporan_id]
    );

    res.json({ message: "Komentar berhasil ditambahkan" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ambil komentar per laporan
export const getComments = async (req, res) => {
  const [data] = await db.query(
    `SELECT c.*, u.username
     FROM comments c
     JOIN users u ON c.user_id = u.id
     WHERE c.laporan_id = ?`,
    [req.params.laporan_id]
  );

  res.json(data);
};