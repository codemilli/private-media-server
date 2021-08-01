import { DynamoEntity } from './DynamoEntity';

export class MediaEntity extends DynamoEntity {
  protected TableName = `private-media`;
  constructor(protected ServiceKey: string) {
    super();
  }
}
