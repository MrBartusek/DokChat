import { useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { ClientToServerEvents, DokChatSocket, ServerToClientEvents } from '../../types/websocket';
import { UserContext } from '../context/UserContext';

export type useWebsocketType = { isConnected?: boolean, socket: Socket<ServerToClientEvents, ClientToServerEvents>};

let socket: Socket = io({ autoConnect: false });

export function useWebsocket(): useWebsocketType {
	const [ isConnected, setIsConnected ] = useState(false);
	const [ user ] = useContext(UserContext);

	useEffect(() => {
		socket = io({
			auth: user.getAuthHeader(),
			autoConnect: true
		});
	}, [ user ]);

	useEffect(() => {
		socket.on('connect', () => {
			setIsConnected(true);
		});
		socket.on('disconnect', () => {
			setIsConnected(false);
		});
		socket.on('connect_error', (err) => {
			console.error(`Websocket connection error: ${err.message}`);
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
