import db from "../config/db.js";

// generate tracking code
const generateCode = async () => {
  const year = new Date().getFullYear();

  const [rows] = await db.query(
    "SELECT id FROM laporan ORDER BY id DESC LIMIT 1"
  );

  let next = rows.length ? rows[0].id + 1 : 1;

  return `LPR-${year}-${String(next).padStart(4, "0")}`;
};

// buat laporan
export const createLaporan = async (req, res) => {
  try {
    const { title, description, category_id } = req.body;

    const code = await generateCode();
    const image = req.file ? req.file.filename : null;

    await db.query(
      `INSERT INTO laporan 
      (title, description, image, tracking_code, status, user_id, category_id)
      VALUES (?, ?, ?, ?, 'pending', ?, ?)`,
      [title, description, image, code, req.user.id, category_id]
    );

    res.json({
      message: "Laporan berhasil dibuat",
      tracking_code: code,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ambil semua laporan
export const getLaporan = async (req, res) => {
  const [data] = await db.query(`
    SELECT l.*, u.username, c.name as category
    FROM laporan l
    JOIN users u ON l.user_id = u.id
    LEFT JOIN categories c ON l.category_id = c.id
    ORDER BY l.id DESC
  `);

  res.json(data);
};

// update status (admin)
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    await db.query(
      "UPDATE laporan SET status=? WHERE id=?",
      [status, req.params.id]
    );

    res.json({ message: "Status berhasil diupdate" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};