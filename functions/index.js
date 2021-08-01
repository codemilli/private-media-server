require('dotenv').config({ path: '.env' });

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const DynamoEntity = require("./modules/DynamoEntity");
// const multer = require('multer');
// const upload = multer();

admin.initializeApp();

const express = require('express');
const cors = require('cors');

const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

app.get('/', async (req, res) => {
  const { postType = '' } = req.query;
  let response;
  try {
    response = await DynamoEntity.query({
      FilterExpression: 'postType = :pt',
      ExpressionAttributeValues: {
        ':pt': postType,
      },
    });
  } catch(err) {
    response = err.message;
  }
  res.json(response);
});

// app.post('/upload', upload.any(), (req, res) => {
//   res.json(200);
// });

exports.assets = functions
  .region('asia-northeast3')
  .runWith({ memory: '2GB' })
  .https.onRequest(app);

