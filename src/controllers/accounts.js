import { successResponse, errorHandler } from '../middlewares/responseHandlers';
import Request from 'request-promise';
import notify from '../utils/notify';
import google from '../utils/google';
const {
  comparePassword,
  encryptPassword,
  generatePassword,
  getJWT,
} = require('../utils/accouunts');
class Accounts {
  constructor() {}

  // methods
  // login
  async loginMethod(req, res, next) {
    try {
      const { models, body } = req;
      let email = body.email.toLowerCase();
      var acct = await models.Accounts.findOne({ email });
      if (!acct) {
        throw Error('No account exists with this email address');
      }
      var correctPassword = await comparePassword(body.password, acct.password);
      if (!correctPassword) {
        throw Error('Incorrect password provided.');
      }
      let info;
      switch (acct.role) {
        case 'Tenant':
          info = await models.Tenants.findById(acct.info)
            .select('-createdAt -updatedAt')
            .lean();
          break;
        case 'Partner':
          info = await models.Partners.findById(acct.info)
            .select('-createdAt -updatedAt')
            .lean();
          break;
        default:
          info = await models.Admins.findById(acct.info)
            .select('-createdAt -updatedAt')
            .lean();
          break;
      }
      if (!acct.verified) {
        let token = generatePassword(40);
        acct.mailToken = token;
        await acct.save();
        new notify().sendEmail(acct.email, 'Verify your email address', {
          template: 'verify_email',
          username: info.fullname,
          useremail: acct.email,
          url: `${process.env.FRONTEND}verify-account?token=${token}`,
        });
        throw Error(
          'This account has not been verified. follow the link in the mail we just sent to your email account.'
        );
      }
      if (acct.suspended) {
        throw Error('This account has been suspended.');
      }
      acct.authToken = generatePassword(80);
      await acct.save();
      acct = await models.Accounts.findOne({ email: body.email })
        .select('-password')
        .lean();
      switch (acct.role) {
        case 'Tenant':
          info = await models.Tenants.findById(acct.info)
            .select('-createdAt -updatedAt')
            .lean();
          break;
        case 'Partner':
          info = await models.Partners.findById(acct.info)
            .select('-createdAt -updatedAt')
            .lean();
          break;
        default:
          info = await models.Admins.findById(acct.info)
            .select('-createdAt -updatedAt')
            .lean();
          break;
      }
      acct.info = info;
      return successResponse(res, 'Account logged in successfully', '00', acct);
    } catch (error) {
      return errorHandler(error, '02', res, next);
    }
  }

  // register
  async registerMethod(req, res, next) {
    try {
      const { models, body } = req;
      let email = body.email.toLowerCase();
      var acct = await models.Accounts.findOne({ email });
      if (acct) {
        throw Error('Another account exists with this email address');
      }
      var hash = await encryptPassword(body.password);
      var user;
      if (body.role === 'Tenant') {
        user = new models.Tenants({
          fullname: body.fullname,
          addressInfo: {
            address: '',
            position: {
              type: 'Point',
              coordinates: [],
            },
          },
        });
      }
      if (body.role === 'Partner') {
        user = new models.Partners({
          fullname: body.fullname,
          company: body.company,
          addressInfo: {
            address: '',
            position: {
              type: 'Point',
              coordinates: [],
            },
          },
        });
      }
      let token = generatePassword(40);
      var account = new models.Accounts({
        info: user._id,
        email: email,
        password: hash,
        verified: false,
        role: body.role,
        mailToken: token,
      });
      let username = body.role === 'Partner' ? user.company : user.fullname;
      await Promise.all([account.save(), user.save()]);
      new notify().sendEmail(account.email, 'Verify your email address', {
        template: 'verify_email',
        username: username,
        useremail: account.email,
        url: `${process.env.FRONTEND}verify-account?token=${token}`,
      });
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

  async resendEmail(req, res, next) {
    try {
      const { models, body } = req;
      let email = body.email.toLowerCase();
      var acct = await models.Accounts.findOne({ email });
      if (!acct) {
        throw Error('No account exists with this email address');
      }
      let token = generatePassword(40);
      acct.mailToken = token;
      await acct.save();
      var user;
      if (acct.role === 'Tenant') {
        user = await models.Tenants.findById(acct.info)
          .select('-createdAt -updatedAt')
          .lean();
      } else if (acct.role === 'Partner') {
        user = await models.Partners.findById(acct.info)
          .select('-createdAt -updatedAt')
          .lean();
      } else {
        user = await models.Admins.findById(acct.info)
          .select('-createdAt -updatedAt')
          .lean();
      }
      new notify().sendEmail(acct.email, 'Verify your email address', {
        template: 'verify_email',
        username: user.fullname,
        useremail: acct.email,
        url: `${process.env.FRONTEND}verify-account?token=${token}`,
      });
      return successResponse(
        res,
        'Verification Email sent successfully',
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
      const { models, user } = req;
      delete user.password;
      var info;
      switch (user.role) {
        case 'Tenant':
          info = await models.Tenants.findById(user.info)
            .select('-createdAt -updatedAt')
            .lean();
          break;
        case 'Partner':
          info = await models.Partners.findById(user.info)
            .select('-createdAt -updatedAt')
            .lean();
          break;
        default:
          info = await models.Admins.findById(user.info)
            .select('-createdAt -updatedAt')
            .lean();
          break;
      }
      user.info = info;
      return successResponse(res, 'Account info fetched', '00', user);
    } catch (error) {
      return errorHandler(error, '02', res, next);
    }
  }

  // create super admin
  async createSuperAdminMethod(req, res, next) {
    try {
      const { models, body } = req;
      var acct = await models.Accounts.findOne({ role: 'SUPER-ADMIN' });
      if (acct) {
        throw Error('Another super admin account exists');
      }
      let email = body.email.toLowerCase();
      acct = await models.Accounts.findOne({ email });
      if (acct) {
        throw Error('Another account exists with this email address');
      }
      var hash = await encryptPassword(body.password);
      var admin = new models.Admins({
        fullname: body.fullname,
      });
      var account = new models.Accounts({
        info: admin._id,
        email: email,
        password: hash,
        verified: true,
        role: 'SUPER-ADMIN',
      });
      await Promise.all([account.save(), admin.save()]);
      return successResponse(
        res,
        'Super admin account created successfully',
        '00',
        {}
      );
    } catch (error) {
      return errorHandler(error, '02', res, next);
    }
  }

  // update account
  async updateAccountMethod(req, res, next) {
    try {
      let updateAcct = req.models.Accounts.update(
        { _id: req.user._id },
        { $set: req.body }
      );
      let updateInfo;
      if (req.user.role === 'Tenant') {
        updateInfo = req.models.Tenants.update(
          { _id: req.user.info },
          { $set: req.body }
        );
      } else if (req.user.role === 'Partner') {
        updateInfo = req.models.Partners.update(
          { _id: req.user.info },
          { $set: req.body }
        );
      } else {
        updateInfo = req.models.Admins.update(
          { _id: req.user.info },
          { $set: req.body }
        );
      }
      await Promise.all([updateAcct, updateInfo]);
      return successResponse(res, 'Account updated successfully', '00', {});
    } catch (error) {
      return errorHandler(error, '02', res, next);
    }
  }

  // verify email of account holder
  async verifyAccountMethod(req, res, next) {
    try {
      const { models, body } = req;
      let acct = await models.Accounts.findOne({ mailToken: body.mailToken });
      if (!acct) {
        throw Error('invalid mail token provided.');
      }
      acct.verified = true;
      acct.mailToken = null;
      await acct.save();
      var user;
      if (acct.role === 'Tenant') {
        user = await models.Tenants.findById(acct.info)
          .select('fullname')
          .lean();
      } else if (acct.role === 'Partner') {
        user = await models.Partners.findById(acct.info)
          .select('fullname')
          .lean();
      } else {
        user = await models.Admins.findById(acct.info)
          .select('fullname')
          .lean();
      }
      new notify().sendEmail(acct.email, 'Welcome to Urbanspace', {
        template: 'welcome',
        username: user.fullname,
      });
      return successResponse(
        res,
        'Account verified successfully. Go ahead and login',
        '00',
        {}
      );
    } catch (error) {
      return errorHandler(error, '02', res, next);
    }
  }

  async googleUrl(req, res, next) {
    try {
      const url = await google.urlGoogle(req.query);
      return successResponse(res, 'Google Url generated', '00', { url });
    } catch (error) {
      return errorHandler('Try again', '02', res, next);
    }
  }

  // google login/register
  async googleMethod(req, res, next) {
    try {
      const { models, body } = req;
      let googleUserAccount = await google.getGoogleAccountFromCode(body.token);
      let acct = await models.Accounts.findOne({
        email: googleUserAccount.email,
      });
      if (!acct) {
        if (!body.role) {
          throw Error('No account exists with this email address');
        }
        let hash = await encryptPassword(generatePassword(10));
        var info;
        switch (body.role) {
          case 'Partner':
            info = new models.Partners({
              fullname:
                googleUserAccount.firstName + ' ' + googleUserAccount.lastName,
              avatar: googleUserAccount.avatar,
              addressInfo: {
                address: '',
                position: {
                  type: 'Point',
                  coordinates: [],
                },
              },
            });
            await info.save();
            break;
          case 'Tenant':
            info = new models.Tenants({
              fullname:
                googleUserAccount.firstName + ' ' + googleUserAccount.lastName,
              avatar: googleUserAccount.avatar,
              addressInfo: {
                address: '',
                position: {
                  type: 'Point',
                  coordinates: [],
                },
              },
            });
            await info.save();
            break;
          default:
            throw Error('Only Tenants or Partners may register with social');
            break;
        }

        let newAccount = new models.Accounts({
          info: info._id,
          email: googleUserAccount.email,
          password: hash,
          verified: true,
          role: body.role,
        });
        await Promise.all([newAccount.save()]);
        acct = newAccount;

        new notify().sendEmail(acct.email, 'Welcome to Urbanspace', {
          template: 'welcome',
          username: info.fullname,
        });
      }
      if (!acct.verified) {
        let token = generatePassword(40);
        acct.mailToken = token;
        await acct.save();
        new notify().sendEmail(acct.email, 'Verify your email address', {
          template: 'verify_email',
          username: info.fullname,
          url: `${process.env.FRONTEND}auth/verify-account?token=${token}`,
        });
        throw Error(
          'This account has not been verified. follow the link in the mail we just sent to your email account.'
        );
      }
      if (acct.suspended) {
        throw Error('This account has been suspended.');
      }
      acct.authToken = generatePassword(80);
      await acct.save();
      acct = await models.Accounts.findOne({ email: googleUserAccount.email })
        .select('-password')
        .lean();
      let infoId = acct.info.toString(),
        infoData;
      if (acct.role === 'Tenant') {
        infoData = await models.Tenants.findById(infoId)
          .select('-createdAt -updatedAt')
          .lean();
      } else if (acct.role == 'Partner') {
        infoData = await models.Partners.findById(infoId)
          .select('-createdAt -updatedAt')
          .lean();
      } else {
        infoData = await models.Admins.findById(infoId)
          .select('-createdAt -updatedAt')
          .lean();
      }
      acct.info = infoData;
      return successResponse(res, 'Account logged in successfully', '00', acct);
    } catch (error) {
      return errorHandler(error, '02', res, next);
    }
  }

  // facebook login/register
  async facebookMethod(req, res, next) {
    try {
      const { models, body } = req;
      const userFieldSet = 'id,name,email,first_name,last_name,picture';

      const options = {
        method: 'GET',
        uri: 'https://graph.facebook.com/v3.3/me',
        qs: {
          access_token: body.access_token,
          fields: userFieldSet,
        },
      };
      let fbRes = await Request(options);
      const account = JSON.parse(fbRes);
      let acct = await models.Accounts.findOne({ email: account.email }).lean();
      if (!acct) {
        if (!body.role) {
          throw Error('No account exists with this email address');
        }
        let hash = await encryptPassword(generatePassword(10));
        var info;
        switch (body.role) {
          case 'Partner':
            info = new models.Partners({
              fullname: account.first_name + ' ' + account.last_name,
              avatar: account.picture.data.url,
              addressInfo: {
                address: '',
                position: {
                  type: 'Point',
                  coordinates: [],
                },
              },
            });
            break;
          case 'Tenant':
            info = new models.Tenants({
              fullname: account.first_name + ' ' + account.last_name,
              avatar: account.picture.data.url,
              addressInfo: {
                address: '',
                position: {
                  type: 'Point',
                  coordinates: [],
                },
              },
            });
            break;
          default:
            throw Error('Only Tenants or Partners may register with social');
            break;
        }
        await info.save();
        let newAccount = new models.Accounts({
          info: info._id,
          email: account.email,
          password: hash,
          verified: true,
          role: body.role,
        });
        await newAccount.save();
        new notify().sendEmail(newAccount.email, 'Welcome to Urbanspace', {
          template: 'welcome',
          username: info.fullname,
        });
      }
      acct = await models.Accounts.findOne({ email: account.email });
      if (!acct.verified) {
        var info;
        if (acct.role == 'Tenant') {
          info = await models.Tenants.findById(acct.info)
            .select('-createdAt -updatedAt')
            .lean();
        } else if (acct.role == 'Partner') {
          info = await models.Partners.findById(acct.info)
            .select('-createdAt -updatedAt')
            .lean();
        } else {
          info = await models.Admins.findById(acct.info)
            .select('-createdAt -updatedAt')
            .lean();
        }
        let token = generatePassword(40);
        acct.mailToken = token;
        await acct.save();
        new notify().sendEmail(acct.email, 'Verify your email address', {
          template: 'verify_email',
          username: info.fullname,
          url: `${process.env.FRONTEND}auth/verify-account?token=${token}`,
        });
        throw Error(
          'This account has not been verified. follow the link in the mail we just sent to your email account.'
        );
      }
      if (acct.suspended) {
        throw Error('This account has been suspended.');
      }
      acct.authToken = generatePassword(80);
      await acct.save();
      acct = await models.Accounts.findOne({ email: account.email })
        .select('-password')
        .lean();
      if (acct.role == 'Tenant') {
        acct.info = await models.Tenants.findById(acct.info)
          .select('-createdAt -updatedAt')
          .lean();
      } else if (acct.role == 'Partner') {
        acct.info = await models.Partners.findById(acct.info)
          .select('-createdAt -updatedAt')
          .lean();
      } else {
        acct.info = await models.Admins.findById(acct.info)
          .select('-createdAt -updatedAt')
          .lean();
      }
      return successResponse(res, 'Account logged in successfully', '00', acct);
    } catch (error) {
      return errorHandler(error, '02', res, next);
    }
  }

  // initiate password reset
  async initiatePasswordResetMethod(req, res, next) {
    try {
      const { models, body } = req;
      let email = body.email.toLowerCase();
      var acct = await models.Accounts.findOne({ email });
      if (!acct) {
        throw Error('No account exists with this email address');
      }
      let info;
      if (acct.role == 'Tenant') {
        info = await models.Tenants.findById(acct.info)
          .select('fullname')
          .lean();
      } else if (acct.role == 'Partner') {
        info = await models.Partners.findById(acct.info)
          .select('fullname')
          .lean();
      } else {
        info = await models.Admins.findById(acct.info)
          .select('fullname')
          .lean();
      }
      let token = generatePassword(50);
      acct.resetToken = token;
      await acct.save();
      new notify().sendEmail(acct.email, 'Reset password request', {
        template: 'password_reset',
        username: info.fullname,
        url: `${process.env.FRONTEND}change-password?token=${token}`,
      });
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
      const { models, body } = req;
      var acct = await models.Accounts.findOne({ resetToken: body.resetToken });
      if (!acct) {
        throw Error('invalid reset token provided');
      }
      var info;
      if (acct.role == 'Tenant') {
        info = await models.Tenants.findById(acct.info)
          .select('-createdAt -updatedAt')
          .lean();
      } else if (acct.role == 'Partner') {
        info = await models.Partners.findById(acct.info)
          .select('-createdAt -updatedAt')
          .lean();
      } else {
        info = await models.Admins.findById(acct.info)
          .select('-createdAt -updatedAt')
          .lean();
      }
      acct.password = await encryptPassword(body.password);
      acct.resetToken = null;
      await acct.save();
      new notify().sendEmail(acct.email, 'Account Password Changed', {
        template: 'password_changed',
        username: info.fullname,
      });
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
