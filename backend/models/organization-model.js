import mongoose from 'mongoose';

export const organizationSchema = new mongoose.Schema({
  logo_url: String,
  title: { type: String, required: true },
  country: String,
  region: String,
  sport: String,
  contacts: [String],
  socials: {
    vk: String,
    telegram: String,
  },
});

organizationSchema.index({
  title: 'text',
  region: 1,
});

export const Organization = mongoose.model('Organization', organizationSchema);
