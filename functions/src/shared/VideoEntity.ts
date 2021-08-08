import { MediaEntity, MediaType } from "./MediaEntity";

export class VideoEntity extends MediaEntity {
  protected mediaType = MediaType.Video;
  public duration: number;
}
