import express from "express";
import { addComment, getComments } from "../controllers/commentController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/", verifyToken, addComment);
router.get("/:laporan_id", verifyToken, getComments);

export default router;