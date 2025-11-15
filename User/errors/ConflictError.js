import AppError from "./AppError.js";

export default class ConflictError extends AppError {
  constructor(message) {
    super(message || "Resource conflict", 409);
  }
}
