const functions = require('firebase-functions');
const admin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });
const { KEY_FILE, REGION, PROJECT_ID, BUCKET_NAME } = process.env;

admin.initializeApp({
  projectId: PROJECT_ID,
  credential: admin.credential.cert(require(`../../config/${KEY_FILE}`)),
});

const express = require('express');
const cors = require('cors');

const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

app.get('/', (req, res) => {
  res.json(200);
});

exports.assets = functions.region(REGION).https.onRequest(app);
