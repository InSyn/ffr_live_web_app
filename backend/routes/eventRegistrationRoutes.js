import express from 'express';
import * as eventRegistrationController from '../controllers/event-registration-controller.js';
import { authenticateToken, isAdmin } from '../middleware/authentication.js';
import { createMulterMiddleware } from '../file-storage/fileStorage.js';

export const onlineRegistrationRouter = express.Router();

const multerFields = [];
for (let i = 0; i < 8; i++) {
  multerFields.push({
    name: `document${i}`,
    maxCount: 1,
  });
}

onlineRegistrationRouter.route('/').post(authenticateToken, createMulterMiddleware(multerFields), eventRegistrationController.addRegistration);

onlineRegistrationRouter.route('/:event_id').get(eventRegistrationController.getAllEventRegistrations);
