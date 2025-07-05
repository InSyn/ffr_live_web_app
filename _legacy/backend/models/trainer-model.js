import mongoose from 'mongoose';

export const athleteTrainerSchema = new mongoose.Schema({
  trainer_id: String,
  fullname: String,
});

export const trainerSchema = new mongoose.Schema({
  photo_url: String,
  trainer_id: { type: String, unique: true, required: true },
  fullname: String,
  gender: String,
  birth_date: Date || null,
  country: String,
  region: String,
  sport: String,
  disciplines: [String],
  trainer_category: String,
  rank: [String],
  position: [String],
  is_national_team: Boolean,
  socials: {
    vk: String,
    telegram: String,
  },
});

trainerSchema.index({
  trainer_id: 1,
  fullname: 'text',
  region: 1,
});

export const Trainer = mongoose.model('Trainer', trainerSchema);
// Trainer.updateMany(
//   {},
//   {
//     $set: {
//       rank: [""], // initialize rank as an empty array
//       position: [""], // initialize position as an empty array
//       trainer_category: "", // initialize trainer_category as an empty string
//     },
//   },
//   {
//     multi: true,
//   },
//   (err, res) => {
//     if (err) {
//       console.error(err);
//     } else {
//       console.log(`Updated ${res.n} documents`);
//     }
//   }
// );
