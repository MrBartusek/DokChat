import React from 'react';
import { Col, Row, Stack, Image, Alert } from 'react-bootstrap';
import { Variant } from 'react-bootstrap/esm/types';
import { IconType } from 'react-icons/lib';
import UserInfo from '../UserInfo/UserInfo';
import './IconButton.scss';

interface Props extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
	icon: IconType,
	size?: number,
	variant?: Variant,
	onClick?: React.MouseEventHandler<HTMLButtonElement>,
	disabled?: boolean,
}

const IconButton = React.forwardRef((props: Props, ref: React.ForwardedRef<any>) => {
	const iconEl = React.createElement(
		props.icon,
		{
			size: (props.size || 38) - 16,
			color: props.variant ? `var(--bs-${props.disabled ? 'secondary' : props.variant})` : 'inherit'
		}
	);
	const passProps = Object.assign({}, props);
	passProps.icon = null; // Icon mess up native button
	return (
		<button
			className={`iconButton ${props.disabled ? 'disabled' : 'enabled'}`}
			onClick={props.onClick}
			disabled={!props.disabled && props.disabled}
			ref={ref}
			{...passProps}
		>
			{iconEl}
		</button>
	);
});

IconButton.displayName = 'IconButton';

export default IconButton;
