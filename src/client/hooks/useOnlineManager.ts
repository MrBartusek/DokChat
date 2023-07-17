import { useContext, useEffect, useState } from 'react';
import { OnlineStatusResponse } from '../../types/websocket';
import { UserContext } from '../context/UserContext';
import { useWebsocketType } from './useWebsocket';

export function useOnlineManager(ws: useWebsocketType): ((userId: string) => [boolean, string | null]) {
	const [ user ] = useContext(UserContext);
	const [ onlineStatus, setOnlineStatus ] = useState<OnlineStatusResponse>([]);
	const [ isInitialized, setInitialized ] = useState(false);

	useEffect(() => {
		if (!ws.isConnected) return;
		if (!isInitialized) refreshList();
		const interval = setInterval(() => refreshList(), 60 * 1000);
		return () => clearInterval(interval);
	}, [ ws.isConnected ]);

	function refreshList() {
		ws.socket.emit('onlineStatus', (response) => {
			setInitialized(true);
			setOnlineStatus(response.data);
		});
	}

	function getOnlineStatus(userId: string): [boolean, string | null] {
		if (userId == user.id) return [ true, null ];
		const status = onlineStatus.find(x => x.id == userId);
		if (!status) return [ false, null ];
		return [ status.isOnline, status.lastSeen ];
	}

	return getOnlineStatus;
}
