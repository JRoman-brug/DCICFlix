import AppError from "./AppError.js";

export default class NotFoundError extends AppError {
  constructor(message) {
    super(message || "Resource not found", 404);
  }
}
