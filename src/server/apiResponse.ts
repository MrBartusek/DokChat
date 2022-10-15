import { Request, Response } from 'express';
import { Socket } from 'socket.io';
import { SocketError } from '../types/error';

export class ApiResponse {
	constructor(
        private resp: Response | Socket,
		private next?: (error?: any) => any
	) {}

	public respond(error: boolean, status: number, message: string, data?: object): Response {
		const result = {
			error: error,
			status: status,
			message: message,
			data: undefined
		};
		if(data) {
			result.data = data;
		}
		const isWebsocket = (this.resp as any).status == undefined;
		if(!isWebsocket) {
			return (this.resp as Response).status(status).json(result).end();
		}
		else {
			if(typeof this.next !== 'function') return;
			if(result.error) {
				return this.next(new SocketError(result.status, result.message));
			}
			this.next(result);
		}

	}

	public success(data?: object): Response {
		return this.respond(false, 200, 'This request was successful', data);
	}

	public error(status: number, message: string): Response {
		return this.respond(true, status, message);
	}

	public badRequest(message?: string) {
		return this.error(400, message || 'Bad Request');
	}

	public methodNotAllowed(req: Request) {
		return this.error(405, `${req.method} is not supported for this resource.`);
	}

	public notFound(message?: string) {
		return this.error(404, message || 'Not found');
	}

	public unauthorized(message?: string) {
		return this.error(401, message || 'Unauthorized');
	}

	public forbidden() {
		return this.error(403, 'Forbidden');
	}
}

