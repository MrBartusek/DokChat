import { NextFunction } from 'express';
import { Socket } from 'socket.io';
import { ApiResponse } from '../apiResponse';
import JWTManager from '../managers/JWTManager';

const ensureAuthenticatedSocket = () => async (socket: Socket, next: NextFunction) => {
	let token: string | undefined = socket.handshake.auth['Authorization'];
	if(!token) {
		return new ApiResponse(socket, next).unauthorized('No token provided');
	}
	if(!token.startsWith('Bearer ')) {
		return new ApiResponse(socket, next).badRequest();
	}
	token = token.replace('Bearer ', '');

	return JWTManager.verifyUserToken(token)
		.then(async(data) => {
			if(data.isBanned) return new ApiResponse(socket, next).forbidden('Account is suspended');
			if(!data.isEmailConfirmed) return new ApiResponse(socket, next).forbidden('E-mail not confirmed');
			socket.auth = data;
			await socket.join(socket.auth.id);
			return next();
		})
		.catch(() => {
			return new ApiResponse(socket, next).unauthorized();
		});
};

export default ensureAuthenticatedSocket;
