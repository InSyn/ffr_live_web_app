import mongoose from 'mongoose';
import { athleteTrainerSchema } from './trainer-model.js';

const sponsorSchema = new mongoose.Schema({
  logo_url: String,
  sponsor_link: String,
});
const medalEventSchema = new mongoose.Schema({
  name: String,
  gold: Number || String,
  silver: Number || String,
  bronze: Number || String,
});

export const forerunnerSchema = new mongoose.Schema({
  number: String,
  name: String,
  region_code: String,
});

export const competingAthleteSchema = new mongoose.Schema({
  local_id: String,
  bib: Number | String,

  rus_code: String,
  name: String,
  lastname: String,
  country_code: String,
  region_code: String,
});

export const athleteSchema = new mongoose.Schema({
  rus_code: { type: String, required: true, unique: true },

  name: { type: String, required: true },
  lastname: { type: String, required: true },
  gender: String,
  birth_date: Date || null,

  photo_url: String,
  photo_tv_url: String,

  country: String,
  country_code: String,
  regions: [String],
  organizations: [String],

  sport: { type: String, required: true },
  disciplines: [String],
  category: String,
  is_national_team: Boolean,
  trainer: athleteTrainerSchema,
  education: String,
  hobbies: [String],
  athleteAbout: String,

  equipment: [String],
  medals: [medalEventSchema],
  sponsors: [sponsorSchema],
  socials: {
    vk: String,
    telegram: String,
  },
});

athleteSchema.index({
  rus_code: 1,
  name: 'text',
  lastname: 'text',
});

export const Athlete = mongoose.model('Athlete', athleteSchema);
