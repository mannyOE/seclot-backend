/* istanbul ignore file */
/**
 * Validation error handler
 * @class
 *
 * @returns {Error} error object
 */
export class NotFoundError extends Error {
  /**
   * @param {string} message error message
   */
  constructor(message) {
    super(message);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NotFoundError);
    }
    const date = new Date();
    this.name = 'NotFoundError';
    this.status = 404;
    this.date = date.toISOString();
  }
}
