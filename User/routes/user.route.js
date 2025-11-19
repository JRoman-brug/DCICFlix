import express from "express";
import {
  createUser,
  deleteUser,
  getUserByEmail,
  getUserById,
  updateUser,
} from "../controllers/user.controller.js";

export const userRouter = express.Router();

userRouter.get("/:id", getUserById);
userRouter.get("/by-email/:email", getUserByEmail);
userRouter.post("/", createUser);
userRouter.patch("/:id", updateUser);
userRouter.delete("/:id", deleteUser);
