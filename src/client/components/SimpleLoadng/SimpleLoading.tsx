import React from 'react';
import { Spinner } from 'react-bootstrap';

export default function SimpleLoading() {
	return (
		<div
			className='d-flex justify-content-center align-items-center'
			// Spinners centered on high elements looks out of place
			// This shifts them higher
			style={{maxHeight: 700}}
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
