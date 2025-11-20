import mongosee, { Schema } from "mongoose";
const RevokedTokenSchema = new Schema({
  jti: { type: String, required: true, unique: true }, //json id to claim
  expiresAt: { type: Date, required: true },
});

export const RevokedToken = mongosee.model(
  "revoked_tokens",
  RevokedTokenSchema
);
