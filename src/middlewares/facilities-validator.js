import { check, validationResult, param } from 'express-validator';

module.exports = {
  //   facilities validators
  createFacility: [
    check('facility.description')
      .exists()
      .withMessage('A description is required to complete this operation'),
    check('facility.name')
      .exists()
      .withMessage('A name of facility is required for this operation'),
    check('facility.address')
      .exists()
      .withMessage('The facility address is required for this operation'),
    check('facility.state')
      .exists()
      .withMessage('The state of operation is required for this operation'),
    check('facility.services')
      .exists()
      .withMessage('A list of your services is required for this operation')
      .isArray()
      .withMessage('This item must be an array of objects'),
    check('facility.coordinates')
      .exists()
      .withMessage(
        'The GPS coordinates of the facility is required for this operation'
      )
      .isArray()
      .withMessage('This item must be an array of coordinates'),
  ],
  addReview: [
    check('review.comment')
      .exists()
      .withMessage('A comment is required to complete this operation'),
    check('review.rating')
      .exists()
      .withMessage('A rating is required for this operation'),
  ],
};
