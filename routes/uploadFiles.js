import express from "express";
import upload from "../middlewares/fileUpload.js";
import {
  getFiles,
  getVideo,
  uploadDocs,
  uploadVideo,
} from "../controllers/fileUpload.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/video", verifyToken, upload.single("video"), uploadVideo);

router.get("/video/:id", verifyToken, getVideo);
router.get("/docs/:folderName", getFiles);

router.post("/docs", verifyToken, upload.single("note"), uploadDocs);

export default router;
