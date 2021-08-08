import { MetadataEntity } from "./MetadataEntity";

export const isValidServiceKey = async (key: string) => {
  let result = false;
  try {
    const metadataEntity = new MetadataEntity('DatabaseMetadata');
    const { Item } = await metadataEntity.getItem('ServiceKeyList');
    const value = Item.Value?.values?.find(s => s === key);
    result = !!value;
  } catch (err) {
    console.log('Error : ', err.message);
  }
  return result;
}
