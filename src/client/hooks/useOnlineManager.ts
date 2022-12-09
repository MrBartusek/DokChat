import { useEffect, useState } from 'react';
import { OnlineStatusResponse } from '../../types/websocket';
import { useFetch } from './useFetch';
import { useWebsocketType } from './useWebsocket';

export function useOnlineManager(ws: useWebsocketType): ((userId: string) => [ boolean, string | null ]) {
	const [ onlineStatus, setOnlineStatus ] = useState<OnlineStatusResponse>([]);
	const [ isInitialized, setInitialized ] = useState(false);

	useEffect(() => {
		const time = 3 * 60 * 1000;
		const interval = setInterval(refreshList, time);
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		if(ws.isConnected && !isInitialized) {
			refreshList();
		}
	}, [ ws.isConnected ]);

	function refreshList() {
		ws.socket.emit('onlineStatus', (response) => {
			setInitialized(true);
			setOnlineStatus(response.data);
		});
	}

	function getOnlineStatus(userId: string): [ boolean, string | null ] {
		const status = onlineStatus.find(x => x.id == userId);
		if(!status) return [ false, null ];
		return [ status.isOnline, status.lastSeen ];
	}

	return getOnlineStatus;
}
