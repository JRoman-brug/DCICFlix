import mongoose from "mongoose";
import { MONGO_URL } from "../config.js";
import debug from "debug";
const log = debug("api-gateway:database");
export function connectDatabase() {
  mongoose
    .connect(MONGO_URL)
    .then(() => log("Connected to MongoDB"))
    .catch((err) => log("Error connecting to MongoDB:", err));
}
