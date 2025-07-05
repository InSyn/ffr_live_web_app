import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

export const competingJurySchema = new mongoose.Schema({
	jury_code: String,
	role: String,
	name: String,
	lastname: String,
	category: String
})

export const jurySchema = new mongoose.Schema({
	jury_code: { type: String, unique: true, required: true },
	is_secretary: { type: Boolean, default: false },

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
		telegram: String
	}
})

jurySchema.index({
	jury_code: 1,
	name: 'text',
	lastname: 'text'
})

jurySchema.plugin(mongoosePaginate)

export const Jury = mongoose.model('Jury', jurySchema)
