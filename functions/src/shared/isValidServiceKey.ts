import { MediaEntity } from "./MediaEntity";

export const isValidServiceKey = async (key: string) => {
  let result = false;
  try {
    const metadataEntity = new MediaEntity('DatabaseMetadata');
    const { Item } = await metadataEntity.getItem('ServiceKeyList');
    const value = Item.Value?.values?.find(s => s === key);
    result = !!value;
  } catch (err) {
    console.log('Error : ', err.message);
  }
  return result;
}
