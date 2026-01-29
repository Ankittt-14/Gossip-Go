import express from "express";
import { sendMessage, getMessages, markAsSeen, getUnreadMessages } from "../controllers/message.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/send/:receiverId", isAuthenticated, sendMessage);
router.post("/seen/:senderId", isAuthenticated, markAsSeen);
router.get("/unread/all", isAuthenticated, getUnreadMessages);
router.get("/:otherParticipantId", isAuthenticated, getMessages);

export default router;