
import { useEffect, useRef, useState } from 'react';
import { ElectronStore } from '../../types/electron';
import Utils from '../helpers/utils';

export function useElectronConfig(): ElectronStore {
	const isCurrent = useRef(true);
	const [ config , setConfig ] = useState<ElectronStore>(null);

	useEffect(() => {
		return () => {
			isCurrent.current = false;
		};
	}, []);

	useEffect(() => {
		const getConfig = async() => window.electron.getConfig();

		const isElectron = Utils.isElectron();
		if(isElectron) {
			getConfig().then((config) => {
				if(isCurrent.current) {
					setConfig(config);
				}
			});
		}
	}, []);
	return config;
}
