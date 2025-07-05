import mongoose from 'mongoose';
import { competitionSchema } from './competition-model.js';
import { documentSchema } from './document-model.js';
import { competingJurySchema } from './jury-model.js';
import { forerunnerSchema } from './athlete-model.js';

export const cupEventSchema = new mongoose.Schema({
  event_id: {
    type: String,
    required: [true, 'Event ID is required'],
    unique: true,
  },

  created_at: Date,
  logo_image_url: String,
  track_image_url: String,
  calendar_code: String,
  season: String,
  sport: String,
  discipline: String,
  country: String,

  cupEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  allowed_secretaries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Jury' }],

  documents: [documentSchema],
});

export const eventSchema = new mongoose.Schema({
  event_id: {
    type: String,
    required: [true, 'Event ID is required'],
    unique: true,
  },
  created_at: Date,
  logo_image_url: String,
  track_image_url: String,
  calendar_code: String,

  title: { type: String, required: [true, 'Event title is required'] },
  international: Boolean,
  start_at: Date || null,
  season: String,
  sport: String,
  discipline: String,
  country: String,
  region: String,
  location: String,

  organization: String,
  organization_logo: String,
  timing_provider: String,

  translation_url: String,

  jury: [competingJurySchema],
  track_info: [String],
  conditions: [String],
  forerunners: [forerunnerSchema],

  competitions: [competitionSchema],

  start_protocols: [documentSchema],
  result_protocols: [documentSchema],
  documents: [documentSchema],
  contacts: [String],

  is_public: { type: Boolean, default: true },
  registration_status: { type: Boolean, default: false },
  allow_registration_by_trainer: { type: Boolean, default: true },
  allow_registration_by_organization: { type: Boolean, default: true },
  allowed_secretaries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Jury' }],
  athletes_groups: [String],
});

eventSchema.index({
  title: 'text',
  discipline: 1,
  season: 1,
  start_at: 1,
  location: 'text',
  calendar_code: 1,
});

export const Event = mongoose.model('Event', eventSchema);
export const CupEvent = mongoose.model('CupEvent', cupEventSchema);
