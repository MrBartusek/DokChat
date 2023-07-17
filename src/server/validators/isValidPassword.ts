import { CustomValidator } from 'express-validator';

export const isValidPassword: CustomValidator = value => {
	if (value.length < 2) {
		throw new Error('Password needs to be at least 2 characters long');
	}
	else if (value.length > 32) {
		throw new Error('Password cannot exceed 32 charters');
	}

	return true;
};
