import { validationResult } from 'express-validator';
import { successResponse, errorHandler } from './responseHandlers';

/**
 * Validation error handler
 * @class
 *
 * @returns {Error} error object
 */
export class ValidationError extends Error {
  /**
   * @param {string} message error message
   * @param {number} statusCode error code
   */
  constructor(message, statusCode) {
    super(message);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
    const date = new Date();
    this.name = 'ValidationError';
    this.status = statusCode;
    this.date = date.toISOString();
  }
}

/**
 * Function to validate request input and check validation result
 *
 * @param {Array} schema - schema to be validated
 *
 * @returns {Array} array of validation schema and middleware to check validation result
 */
export const validator = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let error = errors.array();
    return errorHandler({ message: error[0].msg }, '401', res, next);
  }
  return next();
};
