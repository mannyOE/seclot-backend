import client from './client';

client.process('send email', function(job, done) {
  set(job.data, done);
});

function set(job, done) {
  done();
}
