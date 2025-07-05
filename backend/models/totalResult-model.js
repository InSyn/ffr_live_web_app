import mongoose from 'mongoose'

export const totalResultSchema = new mongoose.Schema({
	competition_id: String,
	competitor_id: String,
	rank: mongoose.Schema.Types.Mixed,
	value: mongoose.Schema.Types.Mixed,
	gap: mongoose.Schema.Types.Mixed
})
