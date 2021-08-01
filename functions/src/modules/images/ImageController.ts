import * as Busboy from 'busboy';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { MediaEntity } from "../../shared/MediaEntity";
import { getImageStorage } from "../../shared/Storage";

export namespace ImageController {
  export const getImage = async (req, res) => {
    const { serviceKey, id } = req.query;
    let response;
    try {
      const mediaEntity = new MediaEntity(serviceKey);
      response = await mediaEntity.getItem(id);
    } catch(err) {
      response = err.message;
    }
    res.json(response);
  };

  export const uploadImage = async (req, res) => {
    const busboy = new Busboy({ headers: req.headers });
    const tmpdir = os.tmpdir();
    const fileInfo = { contentType: '', filename: '' };
    const uploads = {} as any;
    const fileWrites = [];
    const bufs = [];

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      if (fieldname === 'image') {
        console.log(`Processed file ${filename}`, encoding, mimetype);
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

    // Triggered once all uploaded files are processed by Busboy.
    // We still need to wait for the disk writes (saves) to complete.
    busboy.on('finish', async () => {
      await Promise.all(fileWrites);

      for (const key in uploads) {
        const filePath = uploads[key];
        const ext = fileInfo.filename.split('.').slice(-1).pop();
        fs.unlinkSync(filePath);
        const mediaEntity = new MediaEntity(req.query.serviceKey);
        const bucket = getImageStorage()
        const bucketFile = `images/${mediaEntity.Id}/${mediaEntity.Id}.${ext}`;
        const file = bucket.file(bucketFile);
        const options = { resumable: false, metadata: { contentType: fileInfo.contentType } };
        const buffer = Buffer.concat(bufs);
        await file.save(buffer, options);
      }

      res.json(200);
    });

    busboy.end(req.rawBody);
  };
}
