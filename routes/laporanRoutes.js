import express from "express";
import {
  createLaporan,
  getLaporan,
  updateStatus
} from "../controllers/laporanController.js";

import { verifyToken } from "../middleware/verifyToken.js";
import { checkRole } from "../middleware/checkRole.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.get("/", verifyToken, getLaporan);

router.post("/", verifyToken, upload.single("image"), createLaporan);

router.put("/:id", verifyToken, checkRole(["admin", "superadmin"]), updateStatus);

export default router;