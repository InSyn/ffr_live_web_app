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
  reports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OrganizationReport' }],
});
organizationSchema.index({
  title: 'text',
  region: 1,
});

export const organizationReportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  created_at: { type: Date, default: Date.now },
  report_date: { type: Date, required: true },
  files: [
    {
      url: { type: String, required: true },
    },
  ],
});

export const Organization = mongoose.model('Organization', organizationSchema);
export const OrganizationReport = mongoose.model('OrganizationReport', organizationReportSchema);
