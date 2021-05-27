const mailJet = require('node-mailjet');
const fs = require('fs');
const path = require('path');
class Notifications {
  constructor() {
    this.privateKey = process.env.MAIL_JET_SECRET_KEY;
    this.publicKey = process.env.MAIL_JET_PUBLIC_KEY;
    this.senderName = process.env.EMAIL_SENDER;
    this.senderEmail = process.env.EMAIL_ID;
    this.mailJet = mailJet.connect(this.publicKey, this.privateKey);
  }

  async sendEmail(email, subject, data, email_from = false) {
    // console.log(data.token)
    data.year = new Date().getFullYear();
    let hbsPath = path.join(
      __dirname,
      '..',
      'templates',
      data.template + '.hbs'
    );
    fs.readFile(hbsPath, 'utf8', (err, contents) => {
      if (err) {
        console.log('err', err);
        return;
      }
      for (var i in data) {
        var x = '{{' + i + '}}';
        while (contents.indexOf(x) > -1) {
          contents = contents.replace(x, data[i]);
        }
      }
      return this.mailJet
        .post('send')
        .request({
          FromEmail: this.senderEmail,
          FromName: this.senderName,
          Subject: subject,
          'html-part': contents,
          Recipients: [
            {
              Email: email,
            },
          ],
        })
        .then((res, body) => {
          console.log(res.body, 'resp');
        })
        .catch((err, res) => {
          console.log(err, 'err');
        });
    });
  }
}

module.exports = Notifications;
