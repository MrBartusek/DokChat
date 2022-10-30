export default class Validate {
	static username(username: string): string | true {
		// eslint-disable-next-line
		const validCharacters = /^[0-9a-zA-Z_.\-]+$/;

		if(username.length < 5) {
			return 'Username needs to be at least 5 characters long';
		}
		else if(username.length > 32) {
			return 'Username cannot exceed 32 charters';
		}
		else if(!username.match(validCharacters)) {
			return 'Username contains invalid characters';
		}
		return true;
	}

	static password(password: string): string | true {
		if(password.length < 2) {
			return 'Password needs to be at least 2 characters long';
		}
		else if(password.length > 32) {
			return 'Password cannot exceed 32 charters';
		}
		return true;
	}

	static email(email: string): string | true {
		// eslint-disable-next-line
		const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;
		const valid = emailRegex.test(email);
		return valid || 'This email address is invalid';
	}

	static tag(tag: string): string | true {
		if(tag.length != 4) {
			return 'Tag must be 4 charters long';
		}
		const numberRegex = /^[0-9]/g;
		const valid = numberRegex.test(tag);
		return valid || 'Tag must only contain letters';
	}
}
