import { DynamoEntity } from './DynamoEntity';

export enum MediaType {
  Image = 'IMAGE',
  Video = 'VIDEO',
}

export class MediaEntity extends DynamoEntity {
  public mediaType: MediaType;
  public sourceUrl: string;
  public imageUrl: string;
  public imageWidth: number;
  public imageHeight: number;
  public resized: any;
  public test: any;
  protected TableName = `private-media`;
  constructor(protected ServiceKey: string) {
    super();
  }
}
