import express from "express";
import {
  addComment,
  getComments,
  updateComment,
  deleteComment
} from "../controllers/commentController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/", verifyToken, addComment);
router.get("/:laporan_id", verifyToken, getComments);
router.put("/:id", verifyToken, updateComment);
router.delete("/:id", verifyToken, deleteComment);

export default router;