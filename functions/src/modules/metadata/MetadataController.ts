import { MediaEntity } from "../../shared/MediaEntity";

export namespace MetadataController {
  export const getMetadata = async (req, res) => {
    let response;
    try {
      const mediaEntity = new MediaEntity('DatabaseMetadata');
      response = await mediaEntity.query({});
    } catch(err) {
      response = err.message;
    }
    res.json(response);
  };
}
