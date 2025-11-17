import axios from "axios";
import debug from "debug";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {
  loginUserSchema,
  logoutUserSchema,
  refreshSchema,
  registerUserSchema,
} from "../schemas/user.schema.js";
import { SECRET_JWT_KEY, USER_MANAGER_ENDPOINT } from "../config.js";
import {
  BadRequestError,
  NotFoundError,
  SessionExpireError,
} from "../errors/Errors.js";
import { dataParse } from "../utils/utils.js";
const log = debug("auth:auth-controller");

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').next} next
 */
export async function login(req, res, next) {
  try {
    log("New request in login");
    const bodyParse = dataParse(req.body, loginUserSchema.safeParse);

    const { email, password } = bodyParse;
    const request = `${USER_MANAGER_ENDPOINT}/user/by-email/${email}`;
    const { data } = await axios.get(request).catch((err) => {
      throw new NotFoundError("User not found");
    });
    const isPasswordCorrect = await bcrypt.compare(password, data.password);
    if (!isPasswordCorrect) throw new BadRequestError("Incorrect password");
    const token = jwt.sign({ id: data.id, email: data.email }, SECRET_JWT_KEY, {
      expiresIn: "2m",
    });
    return res
      .status(200)
      .json({
        id: data.id,
        email: data.email,
        token: token,
        message: "login sucessfully",
      })
      .send();
  } catch (err) {
    next(err);
  }
}
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').next} next
 */
export async function register(req, res, next) {
  try {
    log("New request in register");
    const bodyParse = dataParse(req.body, registerUserSchema.safeParse);

    const { email, password } = bodyParse;
    const request = `${USER_MANAGER_ENDPOINT}/user/`;
    const bodyRequest = {
      email: email,
      password: password,
    };
    const data = await axios.post(request, bodyRequest).catch((err) => {
      throw new BadRequestError(err.response.data.message);
    });
    const token = jwt.sign({ id: data.id, email: data.email }, SECRET_JWT_KEY, {
      expiresIn: "2m",
    });

    return res
      .status(201)
      .json({
        id: data.id,
        email: data.email,
        token: token,
        message: "login sucessfully",
      })
      .send();
  } catch (err) {
    return next(err);
  }
}
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').next} next
 */
export async function refreshToken(req, res, next) {
  try {
    log("New request in refresh");
    const { token: oldToken } = dataParse(req.body, refreshSchema.safeParse);
    jwt.verify(oldToken, SECRET_JWT_KEY, (err, data) => {
      if (err) {
        throw new SessionExpireError("Session expired");
      }
      const newToken = jwt.sign(
        { id: data.id, email: data.email },
        SECRET_JWT_KEY,
        { expiresIn: "4h" }
      );
      return res.status(200).json({ accessToke: newToken });
    });
  } catch (err) {
    next(err);
  }
}

// TODO: Refactor
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').next} next
 */
export async function logout(req, res, next) {
  try {
    const bodyParse = dataParse(req.params, logoutUserSchema.safeParse);
    const { id, mail } = bodyParse;
    const token = jwt.sign({ id: id, email: mail }, SECRET_JWT_KEY, {
      expiresIn: "1s",
    });
    return res
      .status(201)
      .json({
        id: data.id,
        email: data.email,
        token: token,
        message: "Logout successfully",
      })
      .send();
  } catch (err) {
    next(err);
  }
}
