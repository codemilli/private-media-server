import * as Busboy from 'busboy';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { MediaEntity } from "../../shared/MediaEntity";

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
    // This object will accumulate all the fields, keyed by their name
    const fields = {};

    // This object will accumulate all the uploaded files, keyed by their name.
    const uploads = {};

    // This code will process each non-file field in the form.
    busboy.on('field', (fieldname, val) => {
      /**
       *  TODO(developer): Process submitted field values here
       */
      console.log(`Processed field ${fieldname}: ${val}.`);
      fields[fieldname] = val;
    });

    const fileWrites = [];

    // This code will process each file uploaded.
    busboy.on('file', (fieldname, file, filename) => {
      // Note: os.tmpdir() points to an in-memory file system on GCF
      // Thus, any files in it must fit in the instance's memory.
      console.log(`Processed file ${filename}`);
      const filepath = path.join(tmpdir, filename);
      uploads[fieldname] = filepath;

      const writeStream = fs.createWriteStream(filepath);
      file.pipe(writeStream);

      // File was processed by Busboy; wait for it to be written.
      // Note: GCF may not persist saved files across invocations.
      // Persistent files must be kept in other locations
      // (such as Cloud Storage buckets).
      const promise = new Promise((resolve, reject) => {
        file.on('end', () => {
          writeStream.end();
        });
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });
      fileWrites.push(promise);
    });

    // Triggered once all uploaded files are processed by Busboy.
    // We still need to wait for the disk writes (saves) to complete.
    busboy.on('finish', async () => {
      await Promise.all(fileWrites);

      /**
       * TODO(developer): Process saved files here
       */
      for (const file in uploads) {
        console.log('File : ', file);
        fs.unlinkSync(uploads[file]);
      }
      res.send();
    });

    busboy.end(req.rawBody);
  };
}
