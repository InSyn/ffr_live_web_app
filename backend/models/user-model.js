import mongoose from 'mongoose'

export const userSchema = new mongoose.Schema({
	username: { type: String, required: true, unique: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	role: {
		type: String,
		enum: ['admin', 'secretary', 'jury', 'athlete', 'trainer', 'regional_organization'],
		default: 'user'
	},
	region: String,
	ffr_id: String
})

export const User = mongoose.model('User', userSchema)
