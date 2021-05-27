import { check, validationResult, param } from 'express-validator';

module.exports = {
  //   invoices validators
  createInvoice: [
    check('invoice.amount')
      .exists()
      .withMessage(
        'Amount for this invoice is required to complete this operation'
      ),
    check('invoice.due_date')
      .exists()
      .withMessage(
        'A due duate for this invoice is required for this operation'
      ),
  ],
};
