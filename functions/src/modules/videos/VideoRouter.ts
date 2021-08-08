import * as express from 'express';
import { VideoController } from "./VideoController";
import { ServiceKeyValidationMiddleware } from "../../shared/ServiceKeyValidationMiddleware";
const router = express.Router();

router.get('/', VideoController.get);
router.post('/upload', ServiceKeyValidationMiddleware, VideoController.uploadVideo);

export const VideoRouter = router;
