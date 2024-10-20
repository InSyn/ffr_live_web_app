import mongoose from "mongoose";
import { competitionSchema } from "./competition-model.js";
import { documentSchema } from "./document-model.js";
import { competingJurySchema } from "./jury-model.js";
import { forerunnerSchema } from "./athlete-model.js";

export const eventSchema = new mongoose.Schema({
  event_id: {
    type: String,
    required: [true, "Event ID is required"],
    unique: true,
  },
  created_at: Date,
  logo_image_url: String,
  track_image_url: String,
  calendar_code: String,

  title: { type: String, required: [true, "Event title is required"] },
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
});

eventSchema.index({
  title: "text",
  discipline: 1,
  season: 1,
  start_at: 1,
  location: "text",
  calendar_code: 1,
});

export const Event = mongoose.model("Event", eventSchema);
