import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js"; // ✅ Added loginUser

const router = express.Router();

// POST /api/v1/auth/register
router.post("/register", registerUser);

// POST /api/v1/auth/login
router.post("/login", loginUser); // ✅ New login route

export default router;