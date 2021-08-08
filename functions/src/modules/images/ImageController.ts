import * as Busboy from 'busboy';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as sharp from 'sharp';
import * as sizeOf from 'buffer-image-size';
import { getBucket } from "../../shared/aws";
import { ImageEntity } from "../../shared/ImageEntity";

export namespace ImageController {
  export const getImage = async (req, res) => {
    const { serviceKey, id } = req.query;
    let response;
    try {
      const mediaEntity = new ImageEntity(serviceKey);
      response = await mediaEntity.getItem(id);
    } catch(err) {
      response = err.message;
    }
    res.json(response);
  };

  export const uploadImage = async (req, res) => {
    const { resize } = req.query;
    const busboy = new Busboy({ headers: req.headers });
    const tmpdir = os.tmpdir();
    const fileInfo = { contentType: '', filename: '' };
    const uploads = {} as any;
    const fileWrites = [];
    const bufs = [];

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      if (fieldname === 'image') {
        const filepath = path.join(tmpdir, filename);
        uploads[fieldname] = filepath;

        const writeStream = fs.createWriteStream(filepath);
        file.pipe(writeStream);
        file.on('data', (d) => bufs.push(d));
        fileInfo.contentType = mimetype;
        fileInfo.filename = filename;

        const promise = new Promise((resolve, reject) => {
          file.on('end', () => writeStream.end());
          writeStream.on('finish', resolve);
          writeStream.on('error', reject);
        });
        fileWrites.push(promise);
      }
    });

    busboy.on('finish', async () => {
      await Promise.all(fileWrites);
      let result;
      if (uploads.image) {
        const filePath = uploads.image;
        const ext = fileInfo.filename.split('.').slice(-1).pop();
        fs.unlinkSync(filePath);
        const mediaEntity = new ImageEntity(req.query.serviceKey);
        const bucketFile = `images/${mediaEntity.Id}/${mediaEntity.Id}.${ext}`;
        const buffer = Buffer.concat(bufs);
        const [originalImage, ...resized] = await uploadImageToS3(bucketFile, buffer, fileInfo.contentType, ext, resize);
        mediaEntity.sourceUrl = originalImage.url;
        mediaEntity.sourceWidth = originalImage.width;
        mediaEntity.sourceHeight = originalImage.height;
        mediaEntity.contentType = fileInfo.contentType;
        mediaEntity.ext = ext;
        mediaEntity.resize = resized.reduce((acc, val) => {
          acc[val.width] = val;
          return acc;
        }, {});
        await mediaEntity.save();
        result = mediaEntity;
      }
      res.json(result);
    });

    req.pipe(busboy);
  };
}

const option = {
  bucket: process.env.AWS_BUCKET,
}

interface Image {
  url: string;
  width: number;
  height: number;
}

const uploadImageToS3 = async (directory: string = '', buffer, contentType: string, ext: string, resize = ''): Promise<Image[]> => {
  const resizeList = resize.split(',').filter(val => val && Number.isInteger(Number(val))).map(val => Number(val));
  const originalBufferSize = sizeOf(buffer);
  const resizedBuffers = await Promise.all(resizeList.map((resize) => {
    const resizeVal = Math.min(originalBufferSize.width, resize);
    return sharp(buffer).resize(resizeVal).toBuffer();
  }));
  const resizedBufferSizes = resizedBuffers.map((buf) => sizeOf(buf));
  const originalImage = await uploadPromise(directory, buffer, contentType);
  const resized = await Promise.all(resizedBuffers.map(async (buf, index) => {
    if (resizedBufferSizes[index].width >= originalBufferSize.width) {
      return originalImage;
    }
    const dir = directory.replace(`.${ext}`, `_resized_${resizedBufferSizes[index].width}.${ext}`);
    return uploadPromise(dir, buf, contentType);
  }));
  return [
    {
      url: originalImage,
      width: originalBufferSize.width,
      height: originalBufferSize.height,
    },
    ...resized.map((val, idx) => ({
      url: val,
      width: resizedBufferSizes[idx].width,
      height: resizedBufferSizes[idx].height,
    })),
  ];
}

const uploadPromise = (directory: string, buffer: Buffer, contentType: string): Promise<string> => {
  const s3Bucket = getBucket(option.bucket);
  const data = {
    Bucket: option.bucket,
    Key: directory,
    Body: buffer,
    ContentType: contentType
  };
  return new Promise((resolve, reject) => {
    s3Bucket.upload(data, (err, response) => {
      if (err) {
        reject(err);
      } else {
        resolve(response.Location as string);
      }
    });
  });
}
