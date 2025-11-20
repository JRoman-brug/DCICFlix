import z from "zod";
import { BadRequestError } from "../errors/Errors.js";
import { RevokedToken } from "../models/revokedToken.js";
import debug from "debug";

const log = debug("auth:utils");
export function dataParse(data, parse) {
  const dataParse = parse(data);

  if (!dataParse.success) {
    const errorMessage = z.prettifyError(dataParse.error);
    throw new BadRequestError(errorMessage);
  }
  return dataParse.data;
}

export async function revokeToken(jti, expTimestamp) {
  try {
    const expiresDate = new Date(expTimestamp * 1000);

    const revokedDoc = new RevokedToken({
      jti: jti,
      expiresAt: expiresDate,
    });

    await revokedDoc.save();
    log(`Token ${jti} was add to black list. Expired in: ${expiresDate}`);
    return true;
  } catch (err) {
    if (err.code === 11000) {
      log(`Token ${jti} already claimed. Skipping.`);
      return true;
    }

    throw new BadRequestError("Error to revoke token");
  }
}
