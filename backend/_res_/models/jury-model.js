import mongoose from 'mongoose';

export const competingJurySchema = new mongoose.Schema({
  jury_code: String,
  role: String,
  name: String,
  lastname: String,
  category: String,
});

export const jurySchema = new mongoose.Schema({
  jury_code: { type: String, unique: true, required: true },
  photo_url: String,

  name: { type: String, required: true },
  lastname: { type: String, required: true },
  gender: String,
  birth_date: Date || null,

  country: String,
  region: String,

  jury_category: String,
  sport: String,
  disciplines: [String],

  socials: {
    vk: String,
    telegram: String,
  },
});

jurySchema.index({
  jury_code: 1,
  name: 'text',
  lastname: 'text',
});

export const Jury = mongoose.model('Jury', jurySchema);
