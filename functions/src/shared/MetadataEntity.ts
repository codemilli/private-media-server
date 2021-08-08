import { DynamoEntity } from "./DynamoEntity";

export class MetadataEntity extends DynamoEntity {
  protected TableName = 'private-media';
  constructor(protected ServiceKey: string) {
    super();
  }
}
