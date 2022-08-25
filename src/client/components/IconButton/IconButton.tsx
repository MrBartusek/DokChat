import React from 'react';
import { Col, Row, Stack, Image, Alert } from 'react-bootstrap';
import { Variant } from 'react-bootstrap/esm/types';
import { IconType } from 'react-icons/lib';
import UserInfo from '../UserInfo/UserInfo';

interface Props {
	icon: IconType,
	size?: number,
	variant?: Variant
}

function IconButton({icon, size, variant}: Props) {
	return React.createElement(
		icon,
		{
			size: size || 22,
			color: variant ? `var(--bs-${variant})` : 'inherit'
		}
	);
}
export default IconButton;
