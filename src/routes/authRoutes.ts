import { Router } from "express";
import { login, logout, register } from "../controllers/authController";
import { authenticateJWT } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout",authenticateJWT, logout);

export default router;
