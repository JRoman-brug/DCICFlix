import bcrypt from "bcrypt";
import { userModel } from "../models/user.model.js";
import {
  createUserSchema,
  paramsEmailSchema,
  paramsIdSchema,
  updateUserSchema,
} from "../schema/user.schema.js";
import NotFoundError from "../errors/NotFoundError.js";
import BadRequestError from "../errors/BadRequestError.js";
import z from "zod";
import { SALT } from "../index.js";
import ConflictError from "../errors/ConflictError.js";

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').next} next
 */
export async function getUserById(req, res, next) {
  try {
    const paramsParse = paramsIdSchema.safeParse(req.params);
    if (!paramsParse.success) {
      const message = z.prettifyError(paramsParse.error);
      return next(new BadRequestError(message));
    }
    const user = await userModel.findOne({
      _id: paramsParse.data.id,
    });
    if (!user) return next(new BadRequestError("User not found"));

    return res.status(200).json({
      id: user.id,
      email: user.email,
      password: user.password,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').next} next
 */
export async function getUserByEmail(req, res, next) {
  try {
    const paramsParse = paramsEmailSchema.safeParse(req.params);
    if (!paramsParse.success) {
      const messageError = z.prettifyError(paramsParse.error);
      return next(new BadRequestError(messageError));
    }
    const user = await userModel.findOne({ email: paramsParse.data.email });
    if (user == null) return next(new NotFoundError("User not found"));
    return res.status(200).json({
      id: user.id,
      email: user.email,
      password: user.password,
    });
  } catch (err) {
    return next(err);
  }
}

export async function createUser(req, res, next) {
  try {
    const bodyParse = createUserSchema.safeParse(req.body);
    if (!bodyParse.success) {
      const errorMessage = z.prettifyError(bodyParse.error);
      return next(new BadRequestError(errorMessage));
    }
    const hashedPassword = await bcrypt.hash(bodyParse.data.password, SALT);
    const newUser = await userModel.create({
      email: bodyParse.data.email,
      password: hashedPassword,
    });
    const payload = {
      id: newUser.id,
      email: newUser.email,
    };
    res.status(201).json(payload);
  } catch (err) {
    if (err.code === 11000)
      return next(new ConflictError("Email already in use"));
    return next(err);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').next} next
 */
export async function updateUser(req, res, next) {
  try {
    const idParse = paramsIdSchema.safeParse(req.params);
    const id = idParse.data.id;
    if (!idParse.success) {
      const messageError = z.prettifyError(idParse.error);
      return next(new BadRequestError(messageError));
    }
    const bodyParse = updateUserSchema.safeParse(req.body);
    const dataToUpdate = bodyParse.data;
    if (!bodyParse.success) {
      const messageError = z.prettifyError(bodyParse.error);
      return next(new BadRequestError(messageError));
    }
    if (dataToUpdate.password) {
      dataToUpdate.password = await bcrypt.hash(dataToUpdate.password, SALT);
    }
    const updatedUser = await userModel.findByIdAndUpdate(id, dataToUpdate, {
      new: true,
      runValidators: true,
    });
    return res.status(200).json(updatedUser);
  } catch (err) {
    return next(err);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').next} next
 */
export async function deleteUser(req, res, next) {
  try {
    const paramsParse = paramsIdSchema.safeParse(req.params);
    if (!paramsParse.success) {
      const error = z.prettifyError(paramsParse.error);
      return next(new BadRequestError(error));
    }

    await userModel.deleteOne({
      _id: paramsParse.data.id,
    });

    res.status(202).send("User deleted successfully");
  } catch (err) {
    if (err === 11000) return next(new BadRequestError("No exist user"));
    next(err);
  }
}
