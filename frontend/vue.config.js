const { defineConfig } = require('@vue/cli-service')
const path = require('path')

module.exports = defineConfig({
	transpileDependencies: ['vuetify'],

	// Development server configuration
	devServer: {
		host: '0.0.0.0',
		port: 8080,
		hot: true,
		compress: true,
		historyApiFallback: true,
		client: {
			overlay: {
				warnings: false,
				errors: true
			}
		},
		// Proxy API requests to Docker backend
		proxy: {
			'/api': {
				target: 'http://localhost:8081',
				changeOrigin: true,
				secure: false,
				logLevel: 'debug'
			}
		}
	},

	// Build optimization
	configureWebpack: config => {
		// Resolve aliases
		config.resolve.alias = {
			...config.resolve.alias,
			'@': path.resolve(__dirname, 'src'),
			'@components': path.resolve(__dirname, 'src/components'),
			'@pages': path.resolve(__dirname, 'src/pages'),
			'@assets': path.resolve(__dirname, 'src/assets'),
			'@utils': path.resolve(__dirname, 'src/utils'),
			'@store': path.resolve(__dirname, 'src/store')
		}

		// Production optimizations
		if (process.env.NODE_ENV === 'production') {
			// Remove console logs in production (safe check)
			if (config.optimization.minimizer && config.optimization.minimizer[0]) {
				const terserPlugin = config.optimization.minimizer[0]
				if (terserPlugin.options && terserPlugin.options.terserOptions) {
					terserPlugin.options.terserOptions.compress = {
						...terserPlugin.options.terserOptions.compress,
						drop_console: true
					}
				}
			}

			// Split chunks for better caching
			config.optimization.splitChunks = {
				chunks: 'all',
				cacheGroups: {
					vendor: {
						test: /[\\/]node_modules[\\/]/,
						name: 'vendors',
						chunks: 'all'
					},
					vuetify: {
						test: /[\\/]node_modules[\\/]vuetify[\\/]/,
						name: 'vuetify',
						chunks: 'all'
					}
				}
			}
		}
	},

	// CSS configuration
	css: {
		extract: process.env.NODE_ENV === 'production',
		sourceMap: process.env.NODE_ENV !== 'production',
		loaderOptions: {
			sass: {
				additionalData: '@import "@/assets/styles/global.scss";',
				// Suppress Vuetify SASS deprecation warnings (external  dependency)
				// These warnings come from Vuetify 2.x and will be resolved when migrating to Vuetify 3
				sassOptions: {
					quietDeps: true, // Suppress warnings from node_modules
					verbose: false // Reduce verbosity for external dependencies
				}
			}
		}
	},

	// PWA configuration (disabled for now)
	pwa: {
		workboxPluginMode: 'InjectManifest',
		workboxOptions: {
			swSrc: './src/sw.js'
		}
	},

	// Production build optimizations
	productionSourceMap: false,
	filenameHashing: true,

	// Linting configuration
	lintOnSave: process.env.NODE_ENV !== 'production',

	// Parallel building
	parallel: require('os').cpus().length > 1,

	// Asset optimization
	chainWebpack: config => {
		// Asset optimization (Vue CLI 5.x compatible)
		config.module.rule('images').test(/\.(png|jpe?g|gif|svg)(\?.*)?$/)
		config.module.rule('fonts').test(/\.(woff2?|eot|ttf|otf)(\?.*)?$/)

		// Preload important resources (Vue CLI 5.x compatible)
		if (config.plugins.has('preload')) {
			config.plugin('preload').tap(options => {
				options[0] = {
					rel: 'preload',
					include: 'initial',
					fileBlacklist: [/\.map$/, /hot-update\.js$/]
				}
				return options
			})
		}

		// Prefetch secondary resources (Vue CLI 5.x compatible)
		if (config.plugins.has('prefetch')) {
			config.plugin('prefetch').tap(options => {
				options[0].fileBlacklist = options[0].fileBlacklist || []
				options[0].fileBlacklist.push(/\.map$/, /hot-update\.js$/)
				return options
			})
		}
	}
})
