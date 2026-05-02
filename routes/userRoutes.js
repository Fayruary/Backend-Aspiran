import express from "express";
import { createUser, getUsers } from "../controllers/userController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { checkRole } from "../middleware/checkRole.js";

const router = express.Router();

// hanya superadmin
router.post("/", verifyToken, checkRole(["superadmin"]), createUser);

// lihat semua user (superadmin)
router.get("/", verifyToken, checkRole(["superadmin"]), getUsers);

export default router;