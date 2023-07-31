import React from 'react';
import { Button, ButtonProps, Spinner } from 'react-bootstrap';
import { IconType } from 'react-icons';

export interface InteractiveButtonProps extends ButtonProps {
	loading?: boolean,
	icon?: IconType,
	children?: React.ReactNode
}

function InteractiveButton(props: InteractiveButtonProps) {
	const spinner = (<Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className='me-2' />);
	const iconEl = props.icon ? React.createElement(
		props.icon, { className: 'me-2' }
	) : null;
	return (
		<Button
			disabled={props.disabled || props.loading}
			{...{ ...props, loading: null, icon: null }}
		>
			{props.loading ? spinner : iconEl}
			{props.children}
		</Button>
	);
}

export default InteractiveButton;
