import dotenv from 'dotenv';
import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import mongoose from 'mongoose';

dotenv.config({ path: './.env' });

import { app } from './app.js';
import { ensureUploadsDirExists } from './utils/checkFolder.js';
import { checkAdminPresence } from './utils/checkAdmin.js';
import { syncIndexes } from './utils/indexesPreparation.js';
import { Seminar } from './models/seminar-model.js';

const httpServer = http.createServer(app);
mongoose
  .connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PWD}@${process.env.DB_HOSTNAME}:${process.env.DB_PORT}/${process.env.DB}?authSource=admin`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true,
  })
  .then(async () => {
    console.log('TW DB Connected!');

    await checkAdminPresence();
    // await syncIndexes();
  })
  .catch((e) => {
    console.log(e);
  });

httpServer.listen(process.env.PORT, () => {
  console.log(`HTTP Started on ${process.env.PORT}...`);
});

if (process.env.NODE_ENV !== 'development') {
  const httpsOptions = {
    key: fs.readFileSync('/etc/letsencrypt/live/live.timingweb.com/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/live.timingweb.com/fullchain.pem'),
  };

  const httpsServer = https.createServer(httpsOptions, app);

  httpsServer.listen(443, () => {
    console.log(`HTTPS Started on ${443}...`);
  });
}

ensureUploadsDirExists();
