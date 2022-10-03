import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { ClientToServerEvents, ServerToClientEvents } from '../../types/websocket';

export type useWebsocketType = { isConnected?: boolean, socket: Socket<ServerToClientEvents, ClientToServerEvents>};

const socket = io();

export function useWebsocket(): useWebsocketType {
	const [isConnected, setIsConnected] = useState(socket.connected);

	useEffect(() => {
		socket.on('connect', () => {
			setIsConnected(true);
		});

		socket.on('disconnect', () => {
			setIsConnected(false);
		});
		return () => {
			socket.off('connect');
			socket.off('disconnect');
			socket.off('pong');
		};
	}, []);

	return {
		isConnected: isConnected,
		socket: socket
	};
}
