import bcrypt from 'bcrypt-node';
import JWT from 'jsonwebtoken';
import { errorHandler } from '../middlewares/responseHandlers';

export const encryptPassword = async function(password) {
  // hash password
  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(password, salt);
  // return hash to calling function
  return hash;
};
export const comparePassword = async function(password, hash) {
  return bcrypt.compareSync(password, hash);
};
export const generatePassword = function async(len = 10) {
  var pwdChars =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  var randPassword = Array(len)
    .fill(pwdChars)
    .map(function(x) {
      return x[Math.floor(Math.random() * x.length)];
    })
    .join('');
  return randPassword;
};

export const generateID = function async(len = 10) {
  var pwdChars = '0123456789';
  var randId = Array(len)
    .fill(pwdChars)
    .map(function(x) {
      return x[Math.floor(Math.random() * x.length)];
    })
    .join('');
  return randId;
};

export const getJWT = async function(payload) {
  return JWT.sign(payload, `${process.env.SECRET_KEY}${new Date().getTime()}`);
};

export const verify = async function(req, res, next) {
  try {
    let authToken =
      req.body.verificationCode ||
      req.body.token ||
      req.headers['x-access-token'];
    if (!authToken) {
      errorHandler(
        'Token must be provided to access this route',
        '05',
        res,
        next
      );
    }
    let acct = await req.models.Accounts.findOne({ authToken }).lean();
    if (!acct) {
      errorHandler('Invalid token provided', '03', res, next);
    }
    req.user = acct;
    next();
  } catch (error) {}
};

export const isSuper = async function(req, res, next) {
  try {
    if (req.user.role == 'SUPER-ADMIN') {
      return next();
    }
    throw Error('You are not cleared to access this resource');
  } catch (error) {
    errorHandler(error, '06', res, next);
  }
};

export const isAdmin = async function(req, res, next) {
  try {
    if (req.user.role == 'SUPER-ADMIN' || req.user.role == 'ADMIN') {
      return next();
    }
    throw Error('You are not cleared to access this resource');
  } catch (error) {
    errorHandler(error, '06', res, next);
  }
};

export const isTenant = async function(req, res, next) {
  try {
    if (req.user.role == 'Tenant') {
      return next();
    }
    throw Error('Only tenants may access this resource');
  } catch (error) {
    errorHandler(error, '07', res, next);
  }
};
export const isPartner = async function(req, res, next) {
  try {
    if (req.user.role == 'Partner') {
      return next();
    }
    throw Error('Only partners may access this resource');
  } catch (error) {
    errorHandler(error, '08', res, next);
  }
};
