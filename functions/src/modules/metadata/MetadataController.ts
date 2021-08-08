import { MetadataEntity } from "../../shared/MetadataEntity";

export namespace MetadataController {
  export const getMetadata = async (req, res) => {
    let response;
    try {
      const mediaEntity = new MetadataEntity('DatabaseMetadata');
      response = await mediaEntity.query({});
    } catch(err) {
      response = err.message;
    }
    res.json(response);
  };
}
