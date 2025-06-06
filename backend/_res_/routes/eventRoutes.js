import express from 'express';
import * as eventController from '../controllers/event-controller.js';
import { authenticateToken, isAdmin } from '../middleware/authentication.js';
import { createMulterMiddleware } from '../file-storage/fileStorage.js';

export const eventRouter = express.Router();

const multerFields = [
  { name: 'logo_image_url', maxCount: 1 },
  { name: 'track_image_url', maxCount: 1 },
  { name: 'organization_logo', maxCount: 1 },
];
for (let i = 0; i < 8; i++) {
  multerFields.push({
    name: `document${i}`,
    maxCount: 1,
  });
}

eventRouter.route('/').get(eventController.getAllEvents).post(authenticateToken, isAdmin, createMulterMiddleware(multerFields), eventController.addNewEvent);

eventRouter.route('/find').get(eventController.searchEvents);

eventRouter
  .route('/:id')
  .get(eventController.getEvent)
  .patch(eventController.updateEventResults)
  .put(authenticateToken, isAdmin, createMulterMiddleware(multerFields), eventController.updateEvent)
  .delete(authenticateToken, eventController.deleteEvent);

eventRouter.route('/date-search/:date').get(eventController.getEventByDate);
