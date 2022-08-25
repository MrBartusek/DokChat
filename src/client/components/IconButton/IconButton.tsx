import React from 'react';
import { Col, Row, Stack, Image, Alert } from 'react-bootstrap';
import { Variant } from 'react-bootstrap/esm/types';
import { IconType } from 'react-icons/lib';
import UserInfo from '../UserInfo/UserInfo';
import './IconButton.scss';

interface Props {
	icon: IconType,
	size?: number,
	variant?: Variant
}

function IconButton({icon, size, variant}: Props) {
	const iconEl = React.createElement(
		icon,
		{
			size: (size || 38) - 16,
			color: variant ? `var(--bs-${variant})` : 'inherit'
		}
	);
	return (
		<div className='iconButton'>
			{iconEl}
		</div>
	);
}
export default IconButton;
