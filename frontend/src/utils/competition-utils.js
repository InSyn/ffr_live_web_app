export const getSXHeatCompetitorColor = startOrder => {
	switch (startOrder) {
		case 1:
			return '--raw-status-red-600'
		case 2:
			return '--raw-status-green-600'
		case 3:
			return '--raw-status-blue-500'
		case 4:
			return '--raw-status-yellow-500'

		default:
			return 'transparent'
	}
}
export const getDMOHeatCompetitorColor = startOrder => {
	switch (startOrder) {
		case 1:
			return '--raw-status-blue-500'
		case 2:
			return '--raw-status-red-600'

		default:
			return 'transparent'
	}
}
