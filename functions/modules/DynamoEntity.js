const uuid = require('uuid');
const { ddb } = require('./ddb');
// import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client"

const DEPLOY_ENV = process.env.DEPLOY_ENV || 'local';

class DynamoEntity {
  constructor() {
    this.id = uuid.v1();
  }

  static type = 'Post';
  static tableName = `${DEPLOY_ENV}_jinjujeil`;

  static async getItem(id) {
    return ddb.get({
      TableName: this.tableName,
      Key: {
        itemType: this.type,
        id,
      },
    }).promise();
  }

  static async query(options) {
    const defaultOptions = {
      TableName: this.tableName,
      KeyConditionExpression: 'itemType = :tt',
      ExpressionAttributeValues: {
        ":tt": this.type,
      },
    };
    const merged = {
      ...defaultOptions,
      ...{
        ...options,
        ExpressionAttributeValues: {
          ...defaultOptions.ExpressionAttributeValues,
          ...options.ExpressionAttributeValues,
        },
      },
    };
    return ddb.query(merged).promise();
  }

  static async delete(id) {
    return ddb.delete({
      TableName: DynamoEntity.tableName,
      Key: {
        itemType: this.type,
        id,
      },
    }).promise();
  }

  async save() {
    return ddb.put({
      TableName: DynamoEntity.tableName,
      Item: this,
    }).promise();
  }
}

module.exports = DynamoEntity;
