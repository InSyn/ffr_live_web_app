import * as fs from 'fs';
import * as path from 'path';
import { __dirname } from '../app.js';

export const ensureUploadsDirExists = () => {
  const dir = path.join(__dirname, 'uploads');
  const imagesDir = path.join(dir, 'images');
  const documentsDir = path.join(dir, 'documents');

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
  }
  if (!fs.existsSync(documentsDir)) {
    fs.mkdirSync(documentsDir);
  }
};
