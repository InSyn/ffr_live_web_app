import express from "express";
import * as organizationController from "../controllers/organizations-controller.js";
import { authenticateToken, isAdmin } from "../middleware/authentication.js";
import { createMulterMiddleware } from "../file-storage/fileStorage.js";

export const organizationRouter = express.Router();

organizationRouter
  .route("/")
  .get(organizationController.getAllOrganizations)
  .post(
    authenticateToken,
    isAdmin,
    createMulterMiddleware([{ name: "logo_url", maxCount: 1 }]),
    organizationController.addNewOrganization
  );

organizationRouter
  .route("/find")
  .get(organizationController.searchOrganizations);

organizationRouter
  .route("/:id")
  .get(organizationController.getOrganization)
  .patch(
    authenticateToken,
    isAdmin,
    createMulterMiddleware([{ name: "logo_url", maxCount: 1 }]),
    organizationController.updateOrganization
  )
  .delete(
    authenticateToken,
    isAdmin,
    organizationController.deleteOrganization
  );

organizationRouter
  .route("/:id/athletes")
  .get(organizationController.getAthletesByOrganizationRegion);
