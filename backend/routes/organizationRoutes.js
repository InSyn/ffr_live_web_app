import express from 'express';
import * as organizationController from '../controllers/organizations-controller.js';
import { authenticateToken, isAdmin } from '../middleware/authentication.js';
import { createMulterMiddleware } from '../file-storage/fileStorage.js';
import { getOrganizationIdByRegion } from '../controllers/organizations-controller.js';

export const organizationRouter = express.Router();

organizationRouter
  .route('/')
  .get(organizationController.getAllOrganizations)
  .post(authenticateToken, isAdmin, createMulterMiddleware([{ name: 'logo_url', maxCount: 1 }]), organizationController.addNewOrganization);

organizationRouter.route('/find').get(organizationController.searchOrganizations);

organizationRouter
  .route('/:id')
  .get(organizationController.getOrganization)
  .patch(authenticateToken, isAdmin, createMulterMiddleware([{ name: 'logo_url', maxCount: 1 }]), organizationController.updateOrganization)
  .delete(authenticateToken, isAdmin, organizationController.deleteOrganization);

organizationRouter.route('/:id/athletes').get(organizationController.getAthletesByOrganizationRegion);

organizationRouter
  .route('/:id/reports')
  .post(authenticateToken, createMulterMiddleware([{ name: 'files', maxCount: 5 }]), organizationController.addReportToOrganization);

organizationRouter.route('/findByRegion/:region').get(organizationController.getOrganizationIdByRegion);

organizationRouter.route('/:id/reports/:reportId').delete(authenticateToken, organizationController.deleteReport);
