import { Router } from "express";
import multer from "multer";
import { uploadPdfController, ragQueryController } from "../controllers/ragController";
import { authenticateJWT } from "../middleware/authMiddleware";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload-pdf", authenticateJWT, upload.single("file"), uploadPdfController);
router.post("/search", authenticateJWT, ragQueryController);

export default router;
