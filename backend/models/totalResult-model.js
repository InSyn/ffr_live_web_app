import mongoose from "mongoose";

export const totalResultSchema = new mongoose.Schema({
  competition_id: String,
  competitor_id: String,
  rank: String | Number,
  value: String | Number,
});
