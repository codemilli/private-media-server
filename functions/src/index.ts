require('dotenv').config({ path: '.env' });

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as multer from 'multer';
import { MediaEntity } from "./shared/MediaEntity";
const upload = multer();

admin.initializeApp();

const express = require('express');
const cors = require('cors');

const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

app.get('/metadata', async (req, res) => {
  let response;
  try {
    const mediaEntity = new MediaEntity('DatabaseMetadata');
    response = await mediaEntity.query({});
  } catch(err) {
    response = err.message;
  }
  res.json(response);
});

app.post('/upload', upload.any(), (req, res) => {
  res.json(200);
});

exports.assets = functions
  .region('asia-northeast3')
  .runWith({ memory: '2GB' })
  .https.onRequest(app);

