import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 8080;
const env = process.env.ENV || 'development';
const secrets = {
  jwt: process.env.JWT_SECRET,
  jwtExp: 21600,
};

let databaseURL;
switch (env) {
  case 'test':
  case 'development':
    databaseURL = process.env.DATABASE_URL;
    break;
  default:
    databaseURL = process.env.DATABASE_URL;
    break;
}

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

export default {
  port: normalizePort(port),
  env,
  secrets,
  databaseURL,
  sharePercentage: 3.5,
};
