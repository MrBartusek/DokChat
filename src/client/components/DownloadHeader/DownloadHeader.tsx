import React from 'react';
import { Button, Container } from 'react-bootstrap';
import { BsCloudArrowDown } from 'react-icons/bs';
import './DownloadHeader.scss';

function DownloadHeader() {
	return (
		<div className='download-header w-100'>
			<Container
				className='text-center text-white'
				style={{
					'paddingTop': 'calc(70px + 4rem)',
					'paddingBottom': '6rem',
					'maxWidth': 700
				}}
			>
				<h1 className='display-4'>Download DokChat</h1>
				<p className='lead py-3'>
					Hang out with your friends right on your desktop
				</p>

				<div className='d-flex justify-content-center mt-3 mx-4 gap-3 flex-column flex-lg-row stretch'>
					<Button variant='light' disabled size='lg' className='d-flex justify-content-center align-items-center w-100'>
						<BsCloudArrowDown className='me-2' /> Coming Soon
					</Button>
				</div>

			</Container>
		</div>
	);
}

export default DownloadHeader;
