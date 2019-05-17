const AWS = require("aws-sdk");
const { createCodeBuild } = require('./codebuild-helper.js');

exports.handler = async (event, context, callback) => {
  const callerIdentity = await new AWS.STS().getCallerIdentity().promise();
  const accountID = callerIdentity.Account;

  if (!event.role) event.role = `arn:aws:iam::${accountID}:role/codebuild-execution-full-access`;
  if (!event.accountID) event.accountID = accountID.toString();

  var codeBuildProject = await createCodeBuild(event);
  console.log(codeBuildProject);
  callback();
};
