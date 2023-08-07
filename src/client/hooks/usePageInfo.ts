import { useContext, useEffect, useRef } from 'react';
import Utils from '../helpers/utils';
import { UserContext } from '../context/UserContext';

export interface PageInfoConfig {
    title?: string
    discordTitle?: string,
    discordDetails?: string
}

export function usePageInfo(config: PageInfoConfig, deps: React.DependencyList = []) {
	const [ user ] = useContext(UserContext);
	const documentDefined = typeof document !== 'undefined';

	useEffect(() => {
		if (!documentDefined) return;

		if(config.title) {
			const title = `DokChat - ${config.title}`;
			if (document.title !== title) document.title = title;
		}
		if(Utils.isElectron() && (config.discordTitle || config.discordDetails)) {
			window.electron.updatePresence({
				title: config.discordTitle ?? config.title,
				details: config.discordDetails,
				discriminator: user.isAuthenticated && user.discriminator,
				avatarUrl: user.isAuthenticated && user.avatarCached
			});
		}
	}, deps);
}
