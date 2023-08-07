import { Request, Response } from 'express';
import { Result, ValidationError } from 'express-validator';
import { Socket } from 'socket.io';
import { SocketError } from '../types/error';

const isProduction = (process.env['NODE' + '_ENV'] || 'development') == 'production';

export class ApiResponse {
	constructor(
		private resp: Response | Socket,
		private next?: (error?: any) => any
	) { }

	public respond(error: boolean, status: number, message: string, data?: object): Response {
		const result = {
			error: error,
			status: status,
			message: message,
			data: null as object
		};
		if (data) {
			result.data = data;
		}
		const isWebsocket = (this.resp as any).status == undefined;
		if (!isWebsocket) {
			return (this.resp as Response).status(status).json(result).end();
		}
		else {
			if (typeof this.next !== 'function') return;
			if (result.error) {
				return this.next(new SocketError(result.status, result.message));
			}
			this.next(result);
		}

	}

	public success(data?: object): Response {
		return this.respond(false, 200, '200 OK', data);
	}

	public error(status: number, message: string): Response {
		return this.respond(true, status, message);
	}

	public badRequest(message?: string) {
		return this.error(400, message || '400 Bad Request');
	}

	public methodNotAllowed(req: Request) {
		return this.error(405, `${req.method} is not supported for this resource.`);
	}

	public notFound(message?: string) {
		return this.error(404, message || '404 Not found');
	}

	public unauthorized(message?: string) {
		return this.error(401, message || '401 Unauthorized');
	}

	public forbidden(message?: string) {
		return this.error(403, message || '403 Forbidden');
	}

	public tooManyRequests(message?: string) {
		return this.error(429, message || '429 Too Many Requests');
	}

	public validationError(errors: Result<ValidationError>) {
		if (!isProduction) console.log(errors.array());
		const error = errors.array({ onlyFirstError: true }).at(0);
		let msg = error.msg;
		if (msg == 'Invalid value') {
			msg = `Invalid ${error.param} provided`;
		}
		return this.badRequest(msg);
	}
}

