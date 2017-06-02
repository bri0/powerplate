const mandrill = require('mandrill-api/mandrill');
const mandrillClient = new mandrill.Mandrill(process.env.MANDRILL_KEY);
const crypto = require('crypto');
const DEFAULT_AUTH_HEADER = 'X-Mandrill-Signature'.toLowerCase();
const mandrillInboundURL = '/api/message/mandrill_inbound/ZUPBaxBPoINjXHZrRAcI';

const mandrillSignature = (key, url, params) => {
  params = params || {};
  if (!key || !url) return null;
  const signature = Object.keys(params).sort().reduce((sig, sigkey) => (`${sig}${sigkey}${params[sigkey]}`), url || '');
  return crypto.createHmac('sha1', key).update(signature).digest('base64');
};

module.exports = {
  mandrillClient,
  mandrillInboundURL,
  DEFAULT_AUTH_HEADER,
  sendMail(email, important = false) {
    const { subject, recipient, content, fromEmail } = email;
    const message = {
      html: content,
      subject,
      from_email: fromEmail,
      from_name: 'Powerplate',
      to: [{
        email: recipient.email,
        name: recipient.name,
        type: 'to',
      }],
      headers: {
        'Reply-To': fromEmail,
      },
      important,
      auto_text: true,
    };
    return new Promise((resolve, reject) => {
      mandrillClient.messages.send({
        message,
        async: true,
        ip_pool: 'Main Pool',
      }, (result) => resolve(result), (error) => reject(error));
    });
  },
  mandrillAuth({ key, url }) {
    if (!key || !url) {
      throw new Error('Must provide key and url');
    }
    const header = DEFAULT_AUTH_HEADER;
    return (req, res, next) => {
      const signature = req.get(header);
      if (!signature) return res.status(401).end('Not Authorized');
      const checkSignature = mandrillSignature(key, url, req.body);
      if (signature !== checkSignature) return res.status(403).end('Forbidden');
      return next();
    };
  },
};
