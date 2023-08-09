const fs = require('fs');
const path = require('fs');

module.exports = {
	packagerConfig: {
		asar: true,
		executableName: 'dokchat',
		protocols: [
			{
				'name': 'DokChat Desktop Auth Protocol',
				'schemes': [ 'dokchat', 'dokchat-dev' ]
			}
		],
		icon: __dirname + '/public/img/icons/icon'
	},
	hooks: {
		postMake: (config, makeResults) => {
			for(const result in makeResults) {
				if(result.artifacts.length == 0) continue;
				const artifactFile = result.artifacts[0];
				const artifactPath = artifactFile.substring(0, artifactFile.lastIndexOf('/'));
				const extension = artifactFile.split('.')[artifactFile.split('.').length - 1];
				if(result.platform == 'darwin') {
					fs.renameSync(artifactFile, path.join(artifactPath, 'dokchat-desktop-darwin.zip'));
				}
				if(result.platform == 'linux') {
					fs.renameSync(artifactFile,
						path.join(artifactPath, `dokchat-desktop-linux-${result.arch}.${extension}`));
				}
			}
		}
	},
	rebuildConfig: {},
	publishers: [
		{
			name: '@electron-forge/publisher-github',
			config: {
				repository: {
					owner: 'MrBartusek',
					name: 'DokChat'
				},
				prerelease: true
			}
		}
	],
	makers: [
		{
			name: '@electron-forge/maker-squirrel',
			config: {
				iconUrl: 'https://dokchat.dokurno.dev/img/icons/icon.ico',
				setupExe: 'dokchat-desktop-windows-setup'
			}
		},
		{
			name: '@electron-forge/maker-zip',
			platforms: [ 'darwin' ]
		},
		{
			name: '@electron-forge/maker-deb',
			config: {
				mimeType: [ 'x-scheme-handler/dokchat', 'x-scheme-handler/dokchat-dev' ],
				options: {
					icon: __dirname + '/public/img/icons/512.png'
				}
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
