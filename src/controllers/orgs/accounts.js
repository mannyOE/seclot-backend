import express from 'express';
import Accounts from '../controllers/accounts';
const accountsValidator = require('../middlewares/accountsValidator');
import { validator } from '../middlewares/validator';
import { avatarMiddleware } from '../utils/uploads';
import { verify } from '../utils/accouunts';
const router = express.Router();

router.post('/login', accountsValidator.login, validator, Accounts.loginMethod);
router.post(
  '/register',
  accountsValidator.register,
  validator,
  Accounts.registerMethod
);
router.post(
  '/resend-verify-email',
  accountsValidator.initResetPassword,
  validator,
  Accounts.resendEmail
);
router.post(
  '/create-super-admin',
  accountsValidator.registerAdmin,
  validator,
  Accounts.createSuperAdminMethod
);
router.post(
  '/initiate-password-reset',
  accountsValidator.initResetPassword,
  validator,
  Accounts.initiatePasswordResetMethod
);
router.post(
  '/complete-password-reset',
  accountsValidator.resetPassword,
  validator,
  Accounts.completePasswordReset
);

router.put('/update-account', verify, Accounts.updateAccountMethod);
router.post('/upload-avatar', verify, avatarMiddleware);
router.post(
  '/verify-account',
  accountsValidator.verify,
  validator,
  Accounts.verifyAccountMethod
);
router.get('/me', verify, Accounts.fetchMeMethod);
router.get('/logout', verify, Accounts.logoutMethod);

module.exports = router;
