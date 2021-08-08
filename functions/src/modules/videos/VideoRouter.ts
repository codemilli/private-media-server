import * as express from 'express';
import * as multer from 'multer';
import { VideoController } from "./VideoController";
import { ServiceKeyValidationMiddleware } from "../../shared/ServiceKeyValidationMiddleware";
const router = express.Router();
const upload = multer();

router.get('/', VideoController.get);
router.post('/upload', ServiceKeyValidationMiddleware, upload.any(), VideoController.uploadVideo);

export const VideoRouter = router;
