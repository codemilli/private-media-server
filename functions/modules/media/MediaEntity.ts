import { DynamoEntity } from '../../shared/DynamoEntity';

export class MediaEntity extends DynamoEntity {
  protected ServiceKey = '';
  protected TableName = `private-media`;
}
