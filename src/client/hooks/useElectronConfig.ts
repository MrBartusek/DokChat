
import { useEffect, useState } from 'react';
import { ElectronStore } from '../../types/electron';
import Utils from '../helpers/utils';

export function useElectronConfig(): ElectronStore {
	const [ config , setConfig ] = useState<ElectronStore>(null);

	useEffect(() => {
		const getConfig = async() => window.electron.getConfig();

		const isElectron = Utils.isElectron();
		if(isElectron) {
			getConfig().then(setConfig);
		}
	}, []);
	return config;
}
