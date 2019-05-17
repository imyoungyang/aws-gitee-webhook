import json
import boto3
from botocore.vendored import requests
"""
event: {
    projectName: codebuild project name
    hooks_url: git repos hooks url
    usr: git ee login user
    token: git ee personal access token
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

    hooks_url = event['hooks_url']
    usr = event['usr']
    token = event['token']
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