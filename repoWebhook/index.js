const crypto = require('crypto');
const { getSecrets } = require('./secrets-helper.js');
const secretName = process.ENV.SECRET_NAME;

const sign = (algorithm, secret, buffer) => {
  const hmac = crypto.createHmac(algorithm, secret);
  hmac.update(buffer, 'utf-8');
  return algorithm + '=' + hmac.digest('hex');
};

var secretStore = undefined;
/**
 * @input event: https://developer.github.com/webhooks/#example-delivery
 * @output
 *  {
      res.org = payload.repository.owner.login;
      res.repo = payload.repository.name;
      res.location = payload.repository.full_name;
      res.hooks_url = payload.repository.hooks_url;
    }
**/
exports.handler = async(event) => {
  if (secretStore == undefined) {
    secretStore = JSON.parse(await getSecrets(secretName));
  }

  const secret = secretStore.GITEE_ACCESS_TOKEN;
  const body = event.body;
  const payload = JSON.parse(body);

  // check signature
  const xHubSignature = event.headers['X-Hub-Signature'];
  const k1 = sign('sha1', secret, body);
  console.log("k1: " + k1);
  console.log("xHubSignature: " + xHubSignature);
  console.log("body: " + body);

  var res = {};
  if (k1 == xHubSignature && payload.action == 'created') {
    res.org = payload.repository.owner.login;
    res.repo = payload.repository.name;
    res.location = payload.repository.full_name;
    res.hooks_url = payload.repository.hooks_url;
  }
  return {
    statusCode: 200,
    body: JSON.stringify(res),
  };
};
