import { CustomValidator } from 'express-validator';

export const isValidTag: CustomValidator = value => {
	if(value.length != 4) {
		throw new Error('Tag must be 4 charters long');
	}
	const numberRegex = /^[0-9]/g;
	const valid = numberRegex.test(value);
	if(!valid) {
		throw new Error('Tag must only contain letters');
	}
	return true;
};
