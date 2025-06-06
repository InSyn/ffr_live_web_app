import mongoose from 'mongoose';
import { resultSchema } from './result-model.js';

const heatSchema = new mongoose.Schema({
  competitors: [String],
  results: [String],
});

export const raceSchema = new mongoose.Schema({
  race_id: String,
  live_on: Boolean,
  title: String,

  start_list: [String],
  active_athlete: String,
  results: [resultSchema],

  heats: [heatSchema],
});
