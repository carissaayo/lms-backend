import express from "express";
import upload from "../middlewares/fileUpload.js";
import { getVideo, uploadVideo } from "../controllers/fileUpload.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/video", verifyToken, upload.single("video"), uploadVideo);

router.get("/video/:id", verifyToken, getVideo);

export default router;
