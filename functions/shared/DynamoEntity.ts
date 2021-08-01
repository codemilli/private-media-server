import uuid from 'uuid';
import { ddb } from './ddb';
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client"

export abstract class DynamoEntity {
  protected abstract TableName: string;
  protected abstract ServiceKey: string;
  protected Id: string;

  constructor() {
    this.Id = uuid.v1();
  }

  async getItem(id) {
    return ddb.get({
      TableName: this.TableName,
      Key: {
        ServiceKey: this.ServiceKey,
        Id: id,
      },
    }).promise();
  }

  async query(options: Partial<DocumentClient.QueryInput>) {
    const defaultOptions = {
      TableName: this.TableName,
      KeyConditionExpression: 'ServiceKey = :sk',
      ExpressionAttributeValues: {
        ":sk": this.ServiceKey,
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

  async delete(id) {
    return ddb.delete({
      TableName: this.TableName,
      Key: {
        ServiceKey: this.ServiceKey,
        Id: id,
      },
    }).promise();
  }

  async save() {
    return ddb.put({
      TableName: this.TableName,
      Item: this,
    }).promise();
  }
}
