import db from "../config/db.js";

// generate tracking code
const generateCode = async () => {
  const year = new Date().getFullYear();

  const [rows] = await db.query(
    "SELECT COUNT(*) as total FROM laporan"
  );

  const next = rows[0].total + 1;

  return `LPR-${year}-${String(next).padStart(4, "0")}`;
};

export const createLaporan = async (req, res) => {
  try {
    // BATASI ROLE
    if (req.user.role !== "user") {
      return res.status(403).json({
        message: "Hanya user yang dapat membuat laporan"
      });
    }

    const { title, description, category_id } = req.body;

    if (!title || !description || category_id == null) {
  return res.status(400).json({ message: "Data tidak lengkap" });
}

    const code = await generateCode();
    const images = req.files
  ? req.files.map(file => file.filename)
  : [];

await db.query(
  `INSERT INTO laporan 
  (title, description, image, tracking_code, status, user_id, category_id)
  VALUES (?, ?, ?, ?, 'pending', ?, ?)`,
  [
    title,
    description,
    JSON.stringify(images), // 👈 INI TEMPATNYA
    code,
    req.user.id,
    category_id,
  ]
);

    res.json({
      message: "Laporan berhasil dibuat",
      tracking_code: code,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getLaporan = async (req, res) => {
  try {
    let query = `
      SELECT 
        l.id,
        l.title,
        l.description,
        l.image,
        l.tracking_code,
        l.status,
        l.created_at,
        l.user_id,
        l.category_id,
        u.username,
        c.name AS category
      FROM laporan l
      JOIN users u ON l.user_id = u.id
      LEFT JOIN categories c ON l.category_id = c.id
    `;

    let params = [];

    if (req.user.role === "user") {
      query += " WHERE l.user_id = ? ";
      params.push(req.user.id);
    }

    query += " ORDER BY l.id DESC";

    const [data] = await db.query(query, params);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─────────────────────────────
// UPDATE LAPORAN (USER OWN REPORT)
// ─────────────────────────────
export const updateLaporan = async (req, res) => {
  try {
    let { title, description, category_id } = req.body;
category_id = category_id ? Number(category_id) : null;
    const id = req.params.id;

    const [rows] = await db.query(
      "SELECT * FROM laporan WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Laporan tidak ditemukan" });
    }

    const laporan = rows[0];

    // ✅ hanya pemilik
    if (laporan.user_id !== req.user.id) {
      return res.status(403).json({ message: "Tidak diizinkan" });
    }

    // ✅ TAMBAHAN PENTING: hanya bisa edit saat pending
    if (laporan.status !== "pending") {
      return res.status(400).json({
        message: "Laporan tidak bisa diedit karena sudah diproses",
      });
    }

    await db.query(
      `UPDATE laporan 
       SET title=?, description=?, category_id=? 
       WHERE id=?`,
      [title, description, category_id, id]
    );

    res.json({ message: "Laporan berhasil diupdate" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// update status (admin)
export const updateStatus = async (req, res) => {
  try {
    console.log("PARAMS:", req.params);
    console.log("BODY:", req.body);

    const id = req.params.id;
    const { status } = req.body;

    if (!id) {
      return res.status(400).json({ message: "ID tidak ditemukan" });
    }

    const allowed = ["pending", "verified", "process", "done", "rejected"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Status tidak valid" });
    }

    const [result] = await db.query(
      "UPDATE laporan SET status=? WHERE id=?",
      [status, id]
    );

    console.log("UPDATE RESULT:", result);

    return res.json({ message: "Status berhasil diupdate" });

  } catch (error) {
    console.log("ERROR UPDATE STATUS:", error);
    return res.status(500).json({ error: error.message });
  }
};

// ─────────────────────────────
// DELETE LAPORAN
// ─────────────────────────────
export const deleteLaporan = async (req, res) => {
  try {
    const id = req.params.id;

    const [rows] = await db.query("SELECT * FROM laporan WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Laporan tidak ditemukan" });
    }

    const laporan = rows[0];

    // user hanya bisa hapus punya dia, admin/superadmin bebas
    if (req.user.role === "user" && laporan.user_id !== req.user.id) {
      return res.status(403).json({ message: "Tidak diizinkan" });
    }

    await db.query("DELETE FROM laporan WHERE id = ?", [id]);

    res.json({ message: "Laporan berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};