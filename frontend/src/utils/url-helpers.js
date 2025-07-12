import { backendRootUrl } from '../constants'

export const getImageUrl = url => {
	if (!url) return ''
	if (url.includes('http')) return url

	return `${backendRootUrl}${url}`
}
