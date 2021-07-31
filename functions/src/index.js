const functions = require('firebase-functions');
const admin = require('firebase-admin');
const dotenv = require('dotenv');
const projectId = 'private-media-server';
const bucketName = 'codemilli-private-media-server';
dotenv.config({ path: '.env' });

admin.initializeApp({
  projectId,
  credential: admin.credential.cert(require(`../../config/${process.env.KEY_FILE}`)),
});

const express = require('express');
const cors = require('cors');

const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

app.get('/', (req, res) => {
  res.json(200);
});

exports.assets = functions.region('asia-northeast3').https.onRequest(app);
