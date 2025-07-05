export function isLoggedIn() {
	const userData = JSON.parse(localStorage.getItem('authorizationData'))
	if (!userData) return false

	return !!userData.token // Add more token validation logic here if needed
}
