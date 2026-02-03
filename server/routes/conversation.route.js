import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { createGroup, getMyConversations } from "../controllers/conversation.controller.js";

const router = express.Router();

router.push = router.post; // Alias for consistency if needed, but standard is post

router.post("/create-group", isAuthenticated, createGroup);
router.get("/my-conversations", isAuthenticated, getMyConversations);

export default router;
