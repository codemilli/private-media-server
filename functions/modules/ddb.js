const AWS = require('aws-sdk');

AWS.config.update({
  region: 'ap-northeast-2',
  credentials: {
    accessKeyId: process.env.AWS_DDB_ACCESS_KEY,
    secretAccessKey: process.env.AWS_DDB_SECRET_KEY,
  },
  sslEnabled: false,
  paramValidation: false,
  convertResponseTypes: false,
});

const ddb = new AWS.DynamoDB.DocumentClient({
  region: 'ap-northeast-2',
});

exports.ddb = ddb;
