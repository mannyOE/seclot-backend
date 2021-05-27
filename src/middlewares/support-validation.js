import { check, validationResult, param } from 'express-validator';

module.exports = {
  //   invoices validators
  createTicket: [
    check('support.title')
      .exists()
      .withMessage('A title is required to complete this operation'),
    check('support.description')
      .exists()
      .withMessage('A description is required to complete this operation'),
  ],
};
