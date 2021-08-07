import { DynamoEntity } from './DynamoEntity';

export enum MediaType {
  Image = 'IMAGE',
  Video = 'VIDEO',
}

export abstract class MediaEntity extends DynamoEntity {
  public sourceUrl: string;
  public sourceWidth: number;
  public sourceHeight: number;
  public contentType: string;
  public ext: string;
  protected TableName = 'private-media';
  protected abstract mediaType: MediaType;
  constructor(protected ServiceKey: string) {
    super();
  }
}
