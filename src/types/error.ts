export class SocketError extends Error {
	public error = true;
	public errorMessage: string;

	constructor(public status: number, message: string) {
		super(message);
		this.errorMessage = message;
	}

}
