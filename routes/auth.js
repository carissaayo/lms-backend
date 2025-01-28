import express from "express";

import { loginUser, logoutUser, verifyUser } from "../controllers/users.js";
import {
  changePassword,
  createNewPassword,
  requestResetPasswordLink,
  resetPassword,
} from "../controllers/password.js";
import upload from "../middlewares/fileUpload.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/login", loginUser);
router.get("/verify-email", verifyUser);
router.post("/logout", logoutUser);
router.put("/change-password", verifyToken, upload.none(), changePassword);
router.put(
  "/request-reset",
  verifyToken,
  upload.none(),
  requestResetPasswordLink
);
router.get("/reset-password", upload.none(), createNewPassword);
router.post("/reset-password", upload.none(), resetPassword);

export default router;
