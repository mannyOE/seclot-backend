import mongoose from 'mongoose';
import Debug from 'debug';

mongoose.Promise = global.Promise;
const debug = Debug('api:mongoose:');

const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: true,
  useUnifiedTopology: true,
  poolSize: 10, // Maintain up to 10 socket connections
  // If not connected, return errors immediately rather than waiting for reconnect
  connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
};

const connect = url =>
  mongoose
    .connect(url, options)
    .then(() => {
      console.log(`Successfully connected to ${url}`);
    })
    .catch(err => {
      console.log(err);
    });

export default connect;
