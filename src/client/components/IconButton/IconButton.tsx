import React from 'react';
import { Col, Row, Stack, Image, Alert } from 'react-bootstrap';
import { Variant } from 'react-bootstrap/esm/types';
import { IconType } from 'react-icons/lib';
import UserInfo from '../UserInfo/UserInfo';
import './IconButton.scss';

interface Props {
	icon: IconType,
	size?: number,
	variant?: Variant,
	onClick?: React.MouseEventHandler<HTMLButtonElement>,
	disabled?: boolean,
}

function IconButton({icon, size, variant, onClick, disabled}: Props) {
	if(disabled) onClick = undefined;

	const iconEl = React.createElement(
		icon,
		{
			size: (size || 38) - 16,
			color: variant ? `var(--bs-${disabled ? 'secondary' : variant})` : 'inherit'
		}
	);
	return (
		<button
			className={`iconButton ${disabled ? 'disabled' : 'enabled'}`}
			onClick={onClick}
			disabled={disabled}
		>
			{iconEl}
		</button>
	);
}
export default IconButton;
