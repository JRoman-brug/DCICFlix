import z from "zod";
import { BadRequestError } from "../errors/Errors.js";

export function dataParse(data, parse) {
  const dataParse = parse(data);

  if (!dataParse.success) {
    const errorMessage = z.prettifyError(dataParse.error);
    throw new BadRequestError(errorMessage);
  }
  return dataParse.data;
}
