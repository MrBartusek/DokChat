import React from 'react';
import { ReactNode } from 'react';
import { Spinner } from 'react-bootstrap';

interface Props {
    children?: ReactNode
	loading?: boolean
}

export default function LoadingWrapper({ children, loading }: Props) {
	const spinner = (
		<Spinner
			animation="border"
			variant='secondary'
			role="status"
			aria-hidden="true"
		/>
	);

	return (
		loading ? (
			<div
				className='d-flex justify-content-center align-items-center'
				style={{maxHeight: 700}}
				// Spinners centered on high elements looks out of place
				// This shifts them higher
			>
				{spinner}
			</div>
		) : (<>{children}</>)
	);
}
