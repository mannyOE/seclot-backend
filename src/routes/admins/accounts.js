import express from 'express';
import Accounts from '../../controllers/admin/accounts';
import accountsValidator from './middlewares/validators';
import { validator } from '../../middlewares/validator';
import { avatarMiddleware } from './middlewares/upload';
import { verify } from './middlewares/authentication';
const router = express.Router();

router.post('/login', accountsValidator.login, validator, Accounts.loginMethod);
router.post(
  '/register',
  accountsValidator.register,
  validator,
  Accounts.registerMethod
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
router.get('/me', verify, Accounts.fetchMeMethod);
router.get('/logout', verify, Accounts.logoutMethod);

module.exports = router;
