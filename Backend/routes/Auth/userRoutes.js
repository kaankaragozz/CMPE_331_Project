import express from "express";
import {
  getAllUsers,
  getUser,
  createUser,
  deleteUser
} from "../../controllers/Auth/userController.js";

const router = express.Router();

router.get("/", getAllUsers);
router.get("/:id", getUser);
router.post("/", createUser);
router.delete("/:id", deleteUser);

export default router;
