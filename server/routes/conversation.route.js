import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { createGroup, getMyConversations, acceptInvite, rejectInvite, leaveGroup } from "../controllers/conversation.controller.js";

const router = express.Router();

router.push = router.post; // Alias for consistency if needed, but standard is post

router.post("/create-group", isAuthenticated, createGroup);
router.get("/my-conversations", isAuthenticated, getMyConversations);
router.put("/accept-invite/:groupId", isAuthenticated, acceptInvite);
router.put("/reject-invite/:groupId", isAuthenticated, rejectInvite);
router.put("/leave-group/:groupId", isAuthenticated, leaveGroup);

export default router;
