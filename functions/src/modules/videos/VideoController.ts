import * as Busboy from 'busboy';
import * as fs from 'fs';
import * as util from 'util';
import * as path from 'path';
import * as os from 'os';
import * as FfmpegCommand from 'fluent-ffmpeg';
import { getBucket } from "../../shared/aws";
import { VideoEntity } from "../../shared/VideoEntity";

export namespace VideoController {
  export const get = async (req, res) => {
    const { serviceKey, id } = req.query;
    let response;
    try {
      const mediaEntity = new VideoEntity(serviceKey);
      response = await mediaEntity.getItem(id);
    } catch(err) {
      response = err.message;
    }
    res.json(response);
  };

  export const uploadVideo = async (req, res) => {
    const busboy = new Busboy({ headers: req.headers });
    const tmpdir = os.tmpdir();
    const fileInfo = { contentType: '', filename: '' };
    const uploads = {} as any;
    const fileWrites = [];
    const bufs = [];

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      if (fieldname === 'video') {
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
      if (uploads.video) {
        const filePath = uploads.video;
        const ext = fileInfo.filename.split('.').slice(-1).pop();
        const mediaEntity = new VideoEntity(req.query.serviceKey);
        const bucketPath = `videos/${mediaEntity.Id}`;
        const buffer = Buffer.concat(bufs);
        const dirPath = path.join(tmpdir, mediaEntity.Id);
        await util.promisify(fs.mkdir)(dirPath);
        const command = new FfmpegCommand(filePath);
        command
          .outputOptions([
            '-codec: copy',
            '-bsf:v h264_mp4toannexb',
            '-start_number 0',
            '-hls_time 3',
            '-hls_list_size 0',
            '-f hls'
          ])
          .output(path.join(dirPath, `${mediaEntity.Id}.m3u8`))
          .on('end', () => {
            command.ffprobe(async (err, data) => {
              if (err) {
                fs.unlinkSync(filePath);
                return res.status(500).send('Error');
              }
              const [videoMeta] = data.streams;
              const fileResponse = await uploadVideoDirToS3(mediaEntity.Id, bucketPath, dirPath, buffer, fileInfo.contentType, ext, { width: videoMeta.width, height: videoMeta.height, duration: videoMeta.duration });
              fs.unlinkSync(filePath);
              mediaEntity.sourceUrl = fileResponse.hls;
              mediaEntity.sourceWidth = fileResponse.videoMeta.width;
              mediaEntity.sourceHeight = fileResponse.videoMeta.height;
              mediaEntity.duration = fileResponse.videoMeta.duration;
              mediaEntity.contentType = fileInfo.contentType;
              mediaEntity.ext = ext;
              mediaEntity.originalVideo = fileResponse.originalVideo;
              await mediaEntity.save();
              res.json(mediaEntity);
            });
          })
          .on('error', (err, stdout, stderr) => {
            fs.unlinkSync(filePath);
            console.log('stdout : ', stdout);
            console.error('stderr : ', stderr);
            res.status(500).send('Error');
          })
          .run();
      }
    });

    req.pipe(busboy);
  };
}

const option = {
  bucket: process.env.AWS_BUCKET,
}

interface Video {
  url: string;
  width: number;
  height: number;
  duration: number;
}

const uploadVideoDirToS3 = async (id: string, directory: string = '', dirPath: string, originalFile: Buffer, contentType: string, ext: string, videoMeta: Partial<Video>) => {
  const list =  await util.promisify(fs.readdir)(dirPath);
  const [originalVideo, hls] = await Promise.all([
    uploadPromise(path.join(directory,`${id}.${ext}`), originalFile ,contentType),
    ...list.map(async (filePath) => {
      const contentType = filePath.indexOf('.m3u8') === -1 ? 'video/MP2T' : 'application/x-mpegURL';
      const buffer = await util.promisify(fs.readFile)(path.join(dirPath, filePath));
      return await uploadPromise(path.join(directory, filePath), buffer, contentType);
    }),
  ]);
  return {
    originalVideo,
    hls,
    videoMeta,
  };
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
