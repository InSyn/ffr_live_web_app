import express from 'express';
import * as organizationController from '../controllers/organizations-controller.js';
import { authenticateToken, hasRole, isAdmin, isOrganization } from '../middleware/authentication.js';
import { createMulterMiddleware } from '../file-storage/fileStorage.js';
import { getOrganizationByRegion } from '../controllers/organizations-controller.js';

export const organizationRouter = express.Router();

organizationRouter
  .route('/')
  .get(organizationController.getAllOrganizations)
  .post(authenticateToken, isAdmin, createMulterMiddleware([{ name: 'logo_url', maxCount: 1 }]), organizationController.addNewOrganization);

organizationRouter
  .route('/:id')
  .get(organizationController.getOrganization)
  .patch(authenticateToken, isAdmin, createMulterMiddleware([{ name: 'logo_url', maxCount: 1 }]), organizationController.updateOrganization)
  .delete(authenticateToken, isAdmin, organizationController.deleteOrganization);

organizationRouter.route('/:id/reports').get(organizationController.getReports);

organizationRouter
  .route('/:organization_id/reports/:report_id')
  .get(organizationController.getReportById)
  .put(
    authenticateToken,
    hasRole('admin', 'regional_organization'),
    createMulterMiddleware([{ name: 'files', maxCount: 5 }]),
    organizationController.updateReport
  )
  .delete(authenticateToken, isAdmin, organizationController.deleteReport);

organizationRouter
  .route('/reports/:region')
  .post(authenticateToken, isOrganization, createMulterMiddleware([{ name: 'files', maxCount: 5 }]), organizationController.addReportToOrganization);

organizationRouter.route('/:id/athletes').get(organizationController.getAthletesByOrganizationRegion);

organizationRouter.route('/find').get(organizationController.searchOrganizations);

organizationRouter.route('/findByRegion/:region').get(organizationController.getOrganizationByRegion);
