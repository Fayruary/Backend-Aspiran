import express from "express";
import {
   createLaporan,
  getLaporan,
  updateLaporan,
  updateStatus,
  deleteLaporan
} from "../controllers/laporanController.js";

import { verifyToken } from "../middleware/verifyToken.js";
import { checkRole } from "../middleware/checkRole.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.use(verifyToken);

router.post(
  "/",
  upload.array("images", 5),
  createLaporan
);
router.get("/", getLaporan);
router.put("/:id", updateLaporan);
router.patch("/:id/status", updateStatus);
router.delete("/:id", deleteLaporan);

export default router;