const AWS = require("aws-sdk");
const { createCodeBuild } = require('./codebuild-helper.js');

/**
 * @input {org, repo, location}
 * @return {org, repo, location, projectName, codeBuildProject}
**/
exports.handler = async (event, context, callback) => {
  const callerIdentity = await new AWS.STS().getCallerIdentity().promise();
  const accountID = callerIdentity.Account;

  if (!event.role) event.role = `arn:aws:iam::${accountID}:role/codebuild-execution-full-access`;
  if (!event.accountID) event.accountID = accountID.toString();

  var codeBuildProject = await createCodeBuild(event);
  
  //clone event and prepare result
  var result = JSON.parse(JSON.stringify(event));
  result.projectName = event.org + "_" + event.repo;
  result.codeBuildProject = codeBuildProject;
  callback(result);
};
