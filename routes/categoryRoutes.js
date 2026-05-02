import express from "express";
import { getCategories, createCategory } from "../controllers/categoryController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { checkRole } from "../middleware/checkRole.js";

const router = express.Router();

router.get("/", getCategories);
router.post("/", verifyToken, checkRole(["admin", "superadmin"]), createCategory);

export default router;