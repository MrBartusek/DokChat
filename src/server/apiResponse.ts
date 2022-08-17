import { Response } from 'express';

export class ApiResponse {
	constructor(
        private resp: Response
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
		return this.resp.status(status).json(result).end();
	}

	public success(data?: object): Response {
		return this.respond(false, 200, 'This request was successful', data);
	}

	public error(status: number, message: string): Response {
		return this.respond(true, status, message);
	}

	public userError(message: string) {
		return this.error(400, message);
	}
}
