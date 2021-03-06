import * as uuid from 'uuid';
import { ddb } from './aws';
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client"

export abstract class DynamoEntity {
  protected abstract TableName: string;
  protected abstract ServiceKey: string;
  public Id: string;
  public createdAt: string;
  public updatedAt: string;

  protected constructor() {
    const now = new Date();
    this.Id = uuid.v1();
    this.createdAt = now.toISOString()
    this.updatedAt = now.toISOString()
  }

  public async getItem(id: string) {
    return ddb.get({
      TableName: this.TableName,
      Key: {
        ServiceKey: this.ServiceKey,
        Id: id,
      },
    }).promise();
  }

  public async query(options: Partial<DocumentClient.QueryInput>) {
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

  public async delete(id: string) {
    return ddb.delete({
      TableName: this.TableName,
      Key: {
        ServiceKey: this.ServiceKey,
        Id: id,
      },
    }).promise();
  }

  public async save() {
    return ddb.put({
      TableName: this.TableName,
      Item: this,
    }).promise();
  }
}
