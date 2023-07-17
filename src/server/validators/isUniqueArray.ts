import { CustomValidator } from 'express-validator';

export const isUniqueArray: CustomValidator = value => {
	if (!Array.isArray(value)) return false;
	return (new Set(value)).size == value.length;
};
