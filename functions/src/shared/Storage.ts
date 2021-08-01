import * as admin from 'firebase-admin';

admin.initializeApp({
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
});

export const getImageStorage = () => {
  return admin.storage().bucket();
}
