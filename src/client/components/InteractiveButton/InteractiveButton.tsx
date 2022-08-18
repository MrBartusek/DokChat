import React from 'react';
import { Button, ButtonProps, Spinner } from 'react-bootstrap';

interface Props extends ButtonProps  {
    loading?: boolean,
    children: React.ReactNode
}

function InteractiveButton(props: Props) {
	const spinner = (<Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className='me-2'/>);
	return (
		<Button {...{...props, loading: null}} disabled={props.loading}>
			{props.loading && spinner}
			{props.children}
		</Button>
	);
}

export default InteractiveButton;
