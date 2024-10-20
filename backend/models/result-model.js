import mongoose from "mongoose";

export const resultSchema = new mongoose.Schema({
  race_id: String,
  competitor_id: String,
  marks: [
    {
      judge_id: String,
      value: String | Number,
    },
  ],
  value: String | Number,
  trick_name: String,
});
