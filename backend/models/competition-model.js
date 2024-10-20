import mongoose from "mongoose";
import { raceSchema } from "./race-model.js";
import { totalResultSchema } from "./totalResult-model.js";
import { competingAthleteSchema } from "./athlete-model.js";

export const competitionSchema = new mongoose.Schema({
  competition_id: {
    type: String,
    required: [true, "Competition ID is required"],
  },
  title: String,
  stage: String,

  competitors: [competingAthleteSchema],
  races: [raceSchema],
  total_results: [totalResultSchema],
});
