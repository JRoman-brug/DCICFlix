import debug from "debug";
import jwt from "jsonwebtoken";
import { SECRET_JWT_KEY } from "../config";
const log = debug("auth:JWTMiddleware ");

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').next} next
 */
export async function JWTMiddleware(req, res, next) {
  const token = req.body.token;
  let data = null;
  req.session = { user: null };
  try {
    data = jwt.verify(token, SECRET_JWT_KEY);
  } catch (err) {}
  next();
}
