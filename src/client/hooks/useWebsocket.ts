import { useContext, useEffect, useState } from 'react';
import { Socket, io } from 'socket.io-client';
import { ClientToServerEvents, ServerToClientEvents } from '../../types/websocket';
import { UserContext } from '../context/UserContext';
import Utils from '../helpers/utils';

export type useWebsocketType = { isConnected?: boolean, socket: Socket<ServerToClientEvents, ClientToServerEvents> };

const baseUrl = Utils.getBaseUrl();
let socket: Socket = io(baseUrl, { autoConnect: false });

export function useWebsocket(): useWebsocketType {
	const [ isConnected, setIsConnected ] = useState(false);
	const [ user ] = useContext(UserContext);

	useEffect(() => {
		socket = io(baseUrl, {
			auth: user.getAuthHeader(),
			autoConnect: true
		});
	}, [ user ]);

	useEffect(() => {
		socket.on('connect', () => {
			console.log('WS: connected');
			setIsConnected(true);
		});
		socket.on('disconnect', () => {
			console.log('WS: disconnected');
			setIsConnected(false);
		});
		socket.on('connect_error', (err) => {
			console.error(`WS: connection error - ${err.message}`);
		});
		return () => {
			socket.off('connect');
			socket.off('disconnect');
			socket.off('connect_error');
		};
	}, []);

	return {
		isConnected: isConnected,
		socket: socket
	};
}
