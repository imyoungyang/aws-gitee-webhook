import json, boto3, os, json
from botocore.vendored import requests
"""
event: {
    projectName: codebuild project name
    hooks_url: git repos hooks url
    usr: git ee login user
}
"""
def lambda_handler(event, context):
    codebuild = boto3.client('codebuild')
    project = event['projectName']

    # call api to create webhook
    response = codebuild.create_webhook(projectName=project)
    if not 'webhook' in response:
        return response.json()
    
    webhook = response['webhook']
    
    # Get token
    sm = boto3.client('secretsmanager')
    secretName = os.environ['SECRET_NAME']
    result = sm.get_secret_value(SecretId=secretName)
    secretsStore = json.loads(result['SecretString'])
    token = secretsStore['GITEE_ACCESS_TOKEN']

    hooks_url = event['hooks_url']
    usr = event['usr']
    payload = '''{
        "name": "web",
        "active": true,
        "events": [
            "push",
            "pull_request"
        ],
        "config": {
            "url": "",
            "content_type": "json",
            "secret": ""
        }
    }'''
    payload = json.loads(payload)
    payload['config']['url'] = webhook['payloadUrl']
    payload['config']['secret'] = webhook['secret']

    # call github ee webhook to create webhook
    r = requests.post(hooks_url, auth=(usr, token), json=payload, verify=False)
    print(r.json())