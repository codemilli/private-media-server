// Imports the Google Cloud client library
const path = require('path');
const CloudStorage = require('@google-cloud/storage').Storage;
const KEY_FILE = process.env.KEY_FILE;

console.log('process.env : ', process.env.KEY_FILE);

// For more information on ways to initialize Storage, please see
// https://googleapis.dev/nodejs/storage/latest/Storage.html

// Creates a client using Application Default Credentials
const storage = new CloudStorage({
  projectId: 'private-media-server',
  keyFilename: path.resolve(__dirname, `../config/${KEY_FILE}`),
});

// Creates a client from a Google service account key
// const storage = new Storage({keyFilename: 'key.json'});

/**
 * TODO(developer): Uncomment these variables before running the sample.
 */
// The ID of your GCS bucket
const bucketName = 'codemilli-private-media-server';

storage.bucket(bucketName);

async function createBucket() {
  // Creates the new bucket
  try {
    const response = await storage.createBucket(bucketName);
  } catch(err) {
    console.log('Error : ', err.message);
    return;
  }

  console.log(`Bucket ${bucketName} created.`);
}

createBucket().catch(console.error);

exports.uploadFile = (req, res) => {
  res.status(200).end('hello');
}
