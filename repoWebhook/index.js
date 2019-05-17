const crypto = require('crypto');
const { getSecrets } = require('./secrets-helper.js');
const default_region = "us-east-1";
const secretName = "specialist/poc/cicd";

const sign = (algorithm, secret, buffer) => {
  const hmac = crypto.createHmac(algorithm, secret);
  hmac.update(buffer, 'utf-8');
  return algorithm + '=' + hmac.digest('hex');
};

var secretStore = undefined;

exports.handler = async(event) => {
  if (secretStore == undefined) {
    secretStore = JSON.parse(await getSecrets(secretName, default_region));
  }

  const secret = secretStore.GITEE_ACCESS_TOKEN;

  // TODO implement response. currently, just echo
  const body = event.body;
  const response = {
    statusCode: 200,
    body: JSON.stringify(body),
  };

  // check signature
  const xHubSignature = event.headers['X-Hub-Signature'];
  const k1 = sign('sha1', secret, body);
  console.log("k1: " + k1);
  console.log("xHubSignature: " + xHubSignature);
  console.log("body: " + body);
  const payload = JSON.parse(body);

  if (k1 == xHubSignature && payload.action == 'created') {
    const full_name = payload.repository.full_name;
    const repo_name = payload.repository.name;
    const owner_login = payload.repository.owner.login;
    const hooks_url = payload.repository.hooks_url;

    console.log(`full_name: ${full_name} repo_name: ${repo_name} owner: ${owner_login} hooks_url: ${hooks_url}`);
  }
  return response;
};
