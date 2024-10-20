import mongoose from "mongoose";
import { documentSchema } from "./document-model.js";

export const onlineRegistrationSchema = new mongoose.Schema({
  event_id: String,
  creator_id: String,
  created_at: Date,
  athletes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Athlete" }],
  documents: documentSchema,
});

const OnlineRegistration = mongoose.model(
  "OnlineRegistration",
  onlineRegistrationSchema
);
