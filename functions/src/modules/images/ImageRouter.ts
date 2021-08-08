import * as express from 'express';
import { ImageController } from "./ImageController";
import { ServiceKeyValidationMiddleware } from "../../shared/ServiceKeyValidationMiddleware";
const router = express.Router();

router.get('/', ImageController.getImage);
router.post('/upload', ServiceKeyValidationMiddleware, ImageController.uploadImage);

export const ImageRouter = router;
