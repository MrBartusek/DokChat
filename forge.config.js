module.exports = {
	packagerConfig: {
		asar: true,
		protocols: [
			{
				'name': 'DokChat Desktop Auth Protocol',
				'schemes': [ 'dokchat', 'dokchat-dev' ]
			}
		]
	},
	rebuildConfig: {},
	makers: [
		{
			name: '@electron-forge/maker-squirrel',
			config: {}
		},
		{
			name: '@electron-forge/maker-zip',
			platforms: [ 'darwin' ]
		},
		{
			name: '@electron-forge/maker-deb',
			config: {
				mimeType: [ 'x-scheme-handler/dokchat', 'x-scheme-handler/dokchat-dev' ]
			}
		},
		{
			name: '@electron-forge/maker-rpm',
			config: {}
		}
	],
	plugins: [
		{
			name: '@electron-forge/plugin-auto-unpack-natives',
			config: {}
		}
	]
};
