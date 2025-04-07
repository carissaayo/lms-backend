import express from "express";

import { verifyToken } from "../middlewares/verifyToken.js";
import {
  createUser,
  deleteUser,
  getAllUsers,
  loginUser,
  updateUserProfile,
  makeUserAdmin,
  assignRole,
  getSingleUserByAdmin,
} from "../controllers/users.js";

const router = express.Router();

// User Routes
router.post("/register", createUser);
router.post("/login", loginUser);

router.get("/user/:id", verifyToken, getStudentDetails);
router.get("/user-by-admin/:id", verifyToken, getSingleUserByAdmin);
router.put("/user/:id/make-admin", verifyToken, makeUserAdmin);

router.put("/:id/role", verifyToken, assignRole);
router.get("/", verifyToken, getAllUsers);
router.put("/:id", verifyToken, updateUserProfile);
router.put("/:id", verifyToken, deleteUser);

export default router;
