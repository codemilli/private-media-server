require('dotenv').config({ path: '.env' });

// import * as functions from 'firebase-functions';

import { MetadataRouter } from "./modules/metadata/MetadataRouter";
import { ImageRouter } from "./modules/images/ImageRouter";
import { VideoRouter } from "./modules/videos/VideoRouter";

const express = require('express');
const cors = require('cors');
const timeout = require('connect-timeout');
const app = express();

app.use(timeout('10m'));
// Automatically allow cross-origin requests
app.use(cors({
  origin: function (origin, callback) {
    callback(null, true);
  }
}));

app.use('/metadata', MetadataRouter);
app.use('/images', ImageRouter);
app.use('/videos', VideoRouter);

// exports.assets = functions
//   .region('asia-northeast3')
//   .runWith({ memory: '2GB' })
//   .https.onRequest(app);


app.listen(7000, () => {
  console.log('started');
});
