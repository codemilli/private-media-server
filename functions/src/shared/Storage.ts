import * as admin from 'firebase-admin';

admin.initializeApp({
  projectId: process.env.PROJECT_ID,
  credential: admin.credential.cert(require(`../../config/${process.env.KEY_FILE}`)),
  storageBucket: process.env.STORAGE_BUCKET,
});

export const getStorage = () => {
  return admin.storage();
}

export const getImageStorage = () => {
  return admin.storage().bucket();
}
