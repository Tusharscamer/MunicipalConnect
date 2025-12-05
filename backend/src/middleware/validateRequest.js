// middleware/validateRequestMiddleware.js
import { validationResult } from "express-validator";

/**
 * validateRequestMiddleware
 * Ensures all express-validator checks are passed.
 */
export default function validateRequestMiddleware(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array().map(e => ({
        field: e.param,
        message: e.msg
      }))
    });
  }
  next();
}
