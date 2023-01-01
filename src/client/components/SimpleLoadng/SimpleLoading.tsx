import React from 'react';
import { Spinner } from 'react-bootstrap';

export default function SimpleLoading() {
	return (
		<div
			className='d-flex justify-content-center align-items-center'
			style={{ height: 60 }}
		>
			<Spinner
				animation="border"
				variant='secondary'
				role="status"
				aria-hidden="true"
			/>
		</div>
	);
}
