import multer from 'multer';
import path, { extname } from 'path';
import fs from 'fs';

export const soundsDir = path.join(process.cwd(), "sounds");

// Ensure upload directory exists
if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true });
}

export const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, soundsDir),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  fileFilter: (req, file, cb) => {
    // Allow only audio files
    const supportedExtensions = [".mp3", ".ogg", ".wav", ".flac", ".aac", ".m4a"];
    cb(null, supportedExtensions.includes(extname(file.originalname).toLocaleLowerCase()));
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB in bytes
  },
});
