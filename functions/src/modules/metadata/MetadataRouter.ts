import { MetadataController } from "./MetadataController";

const express = require('express');
const router = express.Router();

router.get('/', MetadataController.getMetadata);

export const MetadataRouter = router;
