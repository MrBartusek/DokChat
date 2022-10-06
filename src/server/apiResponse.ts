import { Request, Response } from 'express';
import { Socket } from 'socket.io';

export class ApiResponse {
	constructor(
        private resp: Response | Socket,
		private next?: (error?: any) => any
	) {}

	public respond(error: boolean, status: number, message: string, data?: object): Response {
		const result: any = {
			error: error,
			status: status,
			message: message
		};
		if(data) {
			result.data = data;
		}
		const isWebsocket = (this.resp as any).status == undefined;
		if(!isWebsocket) {
			return (this.resp as Response).status(status).json(result).end();
		}
		if(typeof this.next !== 'function') return;
		this.next(result);
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

	public notFound() {
		return this.error(404, 'Not found');
	}

	public unauthorized(message?: string) {
		return this.error(401, message || 'Unauthorized');
	}

	public forbidden() {
		return this.error(403, 'Forbidden');
	}
}
