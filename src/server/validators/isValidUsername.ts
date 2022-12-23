import { CustomValidator } from 'express-validator';

export const isValidUsername: CustomValidator = value => {
	// eslint-disable-next-line
    const validCharacters = /^[0-9a-zA-Z_.\-]+$/;

	if(value.length < 5) {
		throw new Error( 'Username needs to be at least 5 characters long');
	}
	else if(value.length > 32) {
		throw new Error('Username cannot exceed 32 charters');
	}
	else if(!value.match(validCharacters)) {
		throw new Error('Username contains invalid characters');
	}
	return true;
};
