import http from 'http';
import Debug from 'debug';
import cluster from 'cluster';
import dotenv from 'dotenv';

import config from './config';
import app from './loaders/express.loader';
import connect from './loaders/mongoose.loader';
require('./utils/worker');
const debug = Debug('api:server:');
dotenv.config();

const isClusterRequired = config.env !== 'development';

app.set('port', config.port);
if (isClusterRequired && cluster.isMaster) {
  const numberOfCores = require('os').cpus().length;
  debug('Master cluster setting up ' + numberOfCores + ' workers');

  for (let i = 0; i < numberOfCores; i++) {
    cluster.fork();
  }

  for (const id in cluster.workers) {
    cluster.workers[id].on('message', function(message) {
      debug(message);
    });
  }

  cluster.on('online', function(worker) {
    debug('Worker ' + worker.process.pid + ' is listening');
  });
} else {
  const server = http.createServer(app);
  connect(config.databaseURL);
  server.listen(config.port, () =>
    console.log(`Server running on PORT: ${config.port}`)
  );

  /**
   * Event listener for HTTP server "error" event.
   */
  server.on('error', function onError(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }

    const bind =
      typeof config.port === 'string'
        ? 'Pipe ' + config.port
        : 'Port ' + config.port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
      default:
        throw error;
    }
  });

  /**
   * Event listener for HTTP server "listening" event.
   */
  server.on('listening', function onListening() {
    const addr = server.address();
    const bind =
      typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    debug('Listening on ' + bind);
  });
}

// if any of the worker process dies then start a new one by simply forking another one
cluster.on('exit', function(worker, code, signal) {
  debug(
    'Worker ' +
      worker.process.pid +
      ' died with code: ' +
      code +
      ', and signal: ' +
      signal
  );
  debug('Starting a new worker');
  cluster.fork();
});
