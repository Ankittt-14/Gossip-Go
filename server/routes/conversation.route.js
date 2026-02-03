import express from "express";
import { protectRoute } from "../middlewares/protectRoute.middleware.js";
import { createGroup, getMyConversations } from "../controllers/conversation.controller.js";

const router = express.Router();

router.push = router.post; // Alias for consistency if needed, but standard is post

router.post("/create-group", protectRoute, createGroup);
router.get("/my-conversations", protectRoute, getMyConversations);

export default router;
