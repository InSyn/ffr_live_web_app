// PM2 requires CommonJS config format. This file must use module.exports, not ESM export default.
// See: https://pm2.keymetrics.io/docs/usage/application-declaration/#javascript-configuration-file
// This file is named .cjs to ensure Node treats it as CommonJS, even with "type": "module" in package.json.

module.exports = {
	apps: [
		{
			name: 'bts',
			script: 'npx',
			args: '@agentdeskai/browser-tools-server@latest',
			watch: false,
			autorestart: true,
			max_restarts: 10,
			restart_delay: 5000,
			env: {
				NODE_ENV: 'development'
			}
		}
	]
}
