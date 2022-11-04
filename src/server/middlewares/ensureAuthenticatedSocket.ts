import { NextFunction, Request, Response } from 'express';
import { Socket } from 'socket.io';
import { ApiResponse } from '../apiResponse';
import AuthManager from '../managers/authManager';

const ensureAuthenticatedSocket = () => async (socket: Socket, next: NextFunction) => {
	let token: string | undefined = socket.handshake.auth['Authorization'];
	if(!token) {
		return new ApiResponse(socket, next).unauthorized('No token provided');
	}
	if(!token.startsWith('Bearer ')) {
		return new ApiResponse(socket, next).badRequest();
	}
	token = token.replace('Bearer ', '');

	return AuthManager.verifyUserToken(token)
		.then(async(data) => {
			socket.auth = data;
			await socket.join(socket.auth.id);
			return next();
		})
		.catch(() => {
			return new ApiResponse(socket, next).unauthorized();
		});
};

export default ensureAuthenticatedSocket;
