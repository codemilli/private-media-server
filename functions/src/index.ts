require('dotenv').config({ path: '.env' });

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import { MetadataRouter } from "./modules/metadata/MetadataRouter";
import { ImageRouter } from "./modules/images/ImageRouter";

admin.initializeApp();

const express = require('express');
const cors = require('cors');
const app = express();

// Automatically allow cross-origin requests
app.use(cors({
  origin: function (origin, callback) {
    callback(null, true);
  }
}));

app.use('/metadata', MetadataRouter);
app.use('/images', ImageRouter);

exports.assets = functions
  .region('asia-northeast3')
  .runWith({ memory: '2GB' })
  .https.onRequest(app);

