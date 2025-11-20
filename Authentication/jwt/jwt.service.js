import jwt from "jsonwebtoken";
import { SECRET_JWT_KEY } from "../config.js";
import util from "util";
import crypto from "crypto";
import debug from "debug";
const log = debug("auth:jwt services");

const verifyAsync = util.promisify(jwt.verify);
const singAsync = util.promisify(jwt.sign);

export async function sign(data, duration) {
  log(data);
  const payload = {
    ...data,
    jti: crypto.randomBytes(16).toString("hex"),
  };
  const token = await singAsync(payload, SECRET_JWT_KEY, {
    expiresIn: duration,
  });
  return token;
}

export async function verify(token) {
  const decodedPayload = await verifyAsync(token, SECRET_JWT_KEY);
  log(decodedPayload);
  return decodedPayload;
}
