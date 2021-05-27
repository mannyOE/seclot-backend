import {
  successResponse,
  errorHandler,
} from '../../middlewares/responseHandlers';
import notify from '../../utils/notify';
const {
  comparePassword,
  encryptPassword,
  generatePassword,
  getJWT,
} = require('../../utils/accouunts');
class Accounts {
  constructor() {}

  // methods
  // login
  async loginMethod(req, res, next) {
    try {
      return successResponse(res, 'Account logged in successfully', '00', {});
    } catch (error) {
      return errorHandler(error, '02', res, next);
    }
  }

  // register
  async registerMethod(req, res, next) {
    try {
      return successResponse(
        res,
        'User account created successfully',
        '00',
        {}
      );
    } catch (error) {
      return errorHandler(error, '02', res, next);
    }
  }

  async logoutMethod(req, res, next) {
    try {
      const { models, user } = req;
      var acct = await models.Accounts.findById(user._id);
      acct.authToken = null;
      await acct.save();
      return successResponse(res, 'user logged out', '00', {});
    } catch (error) {
      return errorHandler(error, '02', res, next);
    }
  }

  // fetch my account detail
  async fetchMeMethod(req, res, next) {
    try {
      return successResponse(res, 'Account info fetched', '00', user);
    } catch (error) {
      return errorHandler(error, '02', res, next);
    }
  }

  // update account
  async updateAccountMethod(req, res, next) {
    try {
      return successResponse(res, 'Account updated successfully', '00', {});
    } catch (error) {
      return errorHandler(error, '02', res, next);
    }
  }

  // initiate password reset
  async initiatePasswordResetMethod(req, res, next) {
    try {
      return successResponse(
        res,
        'Reset link has been sent to your email address',
        '00',
        {}
      );
    } catch (error) {
      return errorHandler(error, '02', res, next);
    }
  }

  // complete password reset
  async completePasswordReset(req, res, next) {
    try {
      return successResponse(
        res,
        'Your password has been changed successfully',
        '00',
        {}
      );
    } catch (error) {
      return errorHandler(error, '02', res, next);
    }
  }
}

module.exports = new Accounts();
