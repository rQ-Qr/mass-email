const dynamoose = require('dynamoose');

dynamoose.aws.sdk.config.update({
    "accessKeyId": "",
    "secretAccessKey": "",
    "sessionToken": "",
    "region": "us-east-1"
});

module.exports = dynamoose;