import { Router } from 'express';
import admin from '../middleware/admin.mid.js';
import multer from 'multer';
import handler from 'express-async-handler';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from '../constants/httpStatus.js';
import { configCloudinary } from '../config/cloudinary.config.js';

const router = Router();
const upload = multer();

router.post(
  '/',
  admin,
  upload.single('image'), // Make sure 'image' matches the name of the file input in your form
  handler(async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        res.status(BAD_REQUEST).send('No file uploaded');
        return;
      }

      const imageUrl = await uploadImageToCloudinary(file.buffer);
      res.status(200).send({ imageUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(INTERNAL_SERVER_ERROR).send('Internal Server Error');
    }
  })
);

const uploadImageToCloudinary = imageBuffer => {
  const cloudinary = configCloudinary();

  return new Promise((resolve, reject) => {
    if (!imageBuffer) {
      reject('No image data provided');
      return;
    }

    cloudinary.uploader.upload_stream((error, result) => {
      if (error || !result) {
        reject(error || 'Failed to upload image');
      } else {
        resolve(result.url);
      }
    }).end(imageBuffer);
  });
};
 
export default router;
