import { CustomValidator } from 'express-validator';
import { CHAT_COLORS } from '../../types/colors';

export const isValidColor: CustomValidator = value => {
	const color = CHAT_COLORS.find(c => c.hex == value);
	if(!color) {
		throw new Error('Invalid color');
	}
	return true;
};
