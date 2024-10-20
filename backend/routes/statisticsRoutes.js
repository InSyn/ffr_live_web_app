import express from "express";
import * as statisticsController from "../controllers/statistics-controller.js";

export const statisticsRouter = express.Router();

statisticsRouter.route("/overall").get(statisticsController.getOverallDbStats);
