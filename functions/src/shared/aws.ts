import * as AWS from 'aws-sdk';

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

export const ddb = new AWS.DynamoDB.DocumentClient({
  region: 'ap-northeast-2',
});

export const getBucket = (bucket: string) => {
  return new AWS.S3({ params: { Bucket: bucket } });
}
