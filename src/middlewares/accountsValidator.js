import { check, validationResult, param } from 'express-validator';

module.exports = {
  // validation chain for register request
  register: [
    check('email')
      .isEmail()
      .withMessage('Email Field must be a valid email address'),

    check('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d@$.!%*#?&]/, 'i')
      .withMessage(
        'Password must contain one special character, one number, one lowercase and one uppercase'
      ),
    check('fullname')
      .exists()
      .withMessage('Fullname field cannot be empty'),
    check('role')
      .exists()
      .withMessage('Your preferred role is required')
      .isIn(['Tenant', 'Partner'])
      .withMessage('Only partners or tenants may use this endpoint'),
  ],

  registerAdmin: [
    check('email')
      .isEmail()
      .withMessage('Email Field must be a valid email address'),

    check('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d@$.!%*#?&]/, 'i')
      .withMessage(
        'Password must contain one special character, one number, one lowercase and one uppercase'
      ),
    check('fullname')
      .exists()
      .withMessage('Fullname field cannot be empty'),
  ],

  // validation chain for login request
  login: [
    check('email')
      .isEmail()
      .withMessage('Email Field must be a valid email address'),

    check('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d@$.!%*#?&]/, 'i')
      .withMessage(
        'Password must contain one number, one lowercase and one uppercase'
      ),
  ],

  // validate resend verification request
  resend: [
    check('email')
      .isEmail()
      .withMessage('Email Field must be a valid email address'),
  ],
  // validate resend verification request
  verify: [
    check('mailToken')
      .exists()
      .withMessage('return the token sent to the mail inbox of user'),
  ],

  // change password
  changePassword: [
    check('oldPassword')
      .isLength({ min: 6 })
      .withMessage('old password must be at least 6 characters long')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d@$.!%*#?&]/, 'i')
      .withMessage(
        'Old password must contain one special character, one number, one lowercase and one uppercase'
      ),
    check('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d@$.!%*#?&]/, 'i')
      .withMessage(
        'Password must contain one special character, one number, one lowercase and one uppercase'
      )
      .custom((value, { req, loc, path }) => {
        if (value !== req.body.confirmPassword) {
          // trow error if passwords do not match
          throw new Error("Passwords don't match");
        } else {
          return value;
        }
      }),
  ],

  // reset password
  resetPassword: [
    check('resetToken')
      .isLength({ min: 50 })
      .withMessage('Reset token must be provided'),
    check('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d@$.!%*#?&]/, 'i')
      .withMessage(
        'Password must contain one special character, one number, one lowercase and one uppercase'
      )
      .custom((value, { req, loc, path }) => {
        if (value !== req.body.confirmPassword) {
          // trow error if passwords do not match
          throw new Error("Passwords don't match");
        } else {
          return value;
        }
      }),
  ],

  // initiate reset password
  initResetPassword: [check('email').isEmail()],
};
