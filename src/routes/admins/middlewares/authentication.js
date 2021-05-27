import { errorHandler } from '../../../middlewares/responseHandlers';

export const verify = async function(req, res, next) {
  try {
    let authToken = req.headers['Token'];
    if (!authToken) {
      errorHandler(
        'Token must be provided to access this route',
        '405',
        res,
        next
      );
    }
    let acct = await req.models.admins.accounts.findOne({ authToken }).lean();
    if (!acct) {
      errorHandler('Invalid token provided', '403', res, next);
    }
    req.account = acct;
    next();
  } catch (error) {}
};
