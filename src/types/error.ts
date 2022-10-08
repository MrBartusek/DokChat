export class SocketError extends Error {
	public error = true;

	constructor(
        public status: number,
        public message: string
	) {
		super(message);
	}

}
