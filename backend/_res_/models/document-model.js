import mongoose from 'mongoose';

export const documentSchema = new mongoose.Schema({
  title: String,
  created_at: Date,
  file: {
    url: { required: true, type: String },
  },
});
