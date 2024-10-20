import mongoose from "mongoose";
import { documentSchema } from "./document-model.js";

const seminarParticipantSchema = new mongoose.Schema({
  code: String,
  fullname: { type: String, required: [true, "Имя участника обязательно"] },
  role: String,
});

export const seminarSchema = new mongoose.Schema({
  title: String,
  sport: String,
  disciplines: [String],
  format: String,
  country: String,
  region: String,
  location: String,
  date: Date || null,
  season: String,
  documents: [documentSchema],
  contacts: [String],

  participants: [seminarParticipantSchema],
});

seminarSchema.index({
  region: 1,
  location: "text",
  date: 1,
  season: 1,
});

export const Seminar = mongoose.model("Seminar", seminarSchema);
