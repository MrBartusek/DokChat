
import { useEffect, useState } from 'react';
import { ElectronAPIConfig } from '../helpers/electronTypes';
import Utils from '../helpers/utils';

export function useElectronConfig(): ElectronAPIConfig {
	const [ config , setConfig ] = useState<ElectronAPIConfig>(null);

	useEffect(() => {
		const getConfig = async() => window.electron.getConfig();

		const isElectron = Utils.isElectron();
		if(isElectron) {
			getConfig().then(setConfig);
		}
	}, []);
	return config;
}
