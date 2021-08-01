import * as express from 'express';
import * as multer from 'multer';
import { ImageController } from "./ImageController";
import { ServiceKeyValidationMiddleware } from "../../shared/ServiceKeyValidationMiddleware";
const router = express.Router();
const upload = multer();

router.get('/', ServiceKeyValidationMiddleware, ImageController.getImage);
router.post('/upload', ServiceKeyValidationMiddleware, upload.any(), ImageController.uploadImage);

export const ImageRouter = router;
