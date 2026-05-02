import db from "../config/db.js";

// ambil semua kategori
export const getCategories = async (req, res) => {
  const [data] = await db.query("SELECT * FROM categories");
  res.json(data);
};

// tambah kategori
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    await db.query("INSERT INTO categories (name) VALUES (?)", [name]);

    res.json({ message: "Kategori berhasil ditambah" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};