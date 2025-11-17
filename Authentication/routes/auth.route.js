import express from "express";
import {
  login,
  logout,
  refreshToken,
  register,
} from "../controller/auth.controller.js";
export const authRouter = express.Router();

authRouter.post("/login", login);
authRouter.post("/register", register);
authRouter.post("/logout", logout);
authRouter.post("/refresh", refreshToken);
