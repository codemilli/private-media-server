import { MediaEntity, MediaType } from "./MediaEntity";

export class ImageEntity extends MediaEntity {
  protected mediaType = MediaType.Image;
  public resize: any;
}
