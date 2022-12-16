import React from 'react';
import { Variant } from 'react-bootstrap/esm/types';
import { IconType } from 'react-icons/lib';
import './IconButton.scss';

export interface IconButtonProps extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
	icon: IconType,
	size?: number,
	variant?: Variant,
	color?: string,
	onClick?: React.MouseEventHandler<HTMLButtonElement>,
	disabled?: boolean,
}

const IconButton = React.forwardRef((props: IconButtonProps, ref: React.ForwardedRef<any>) => {
	const passProps = Object.assign({}, props);
	passProps.icon = null; // Icon mess up native button
	passProps.className += ` iconButton ${props.disabled ? 'disabled' : 'enabled'}`;
	if(props.disabled) {
		passProps.variant = 'secondary';
	}

	const iconEl = React.createElement(
		props.icon,
		{
			size: (props.size || 38) - 16,
			color: passProps.variant ? `var(--bs-${passProps.variant})` : passProps.color || null
		}
	);

	return (
		<button ref={ref} {...passProps}>
			{iconEl}
		</button>
	);
});

IconButton.displayName = 'IconButton';

export default IconButton;
