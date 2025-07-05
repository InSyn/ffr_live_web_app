import dotenv from 'dotenv';
import * as http from 'http';
import mongoose from 'mongoose';
import { app } from './app.js';
import { ensureUploadsDirExists } from './utils/checkFolder.js';
import { checkAdminPresence } from './utils/checkAdmin.js';

dotenv.config({ path: './.env' });

const httpServer = http.createServer(app);
mongoose
  .connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PWD}@${process.env.DB_HOSTNAME}:${process.env.DB_PORT}/${process.env.DB}?authSource=admin`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(async () => {
    console.log('TW DB Connected!');

    await checkAdminPresence();
  })
  .catch((e) => {
    console.log(e);
  });

httpServer.listen(process.env.PORT, () => {
  console.log(`HTTP Started on ${process.env.PORT}...`);
});

ensureUploadsDirExists();
