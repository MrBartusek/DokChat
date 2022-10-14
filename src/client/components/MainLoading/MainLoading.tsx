import React from 'react';
import { Spinner } from 'react-bootstrap';
import { BsFillChatSquareTextFill } from 'react-icons/bs';
import './MainLoading.scss';

export default function MainLoading() {
	// When developing this loading screen popping up on
	// refresh is so annoying
	if(location.hostname == 'localhost') {
		return (<></>);
	}

	return (
		<div className='mainLoading'>
			<div
				className='d-flex justify-content-center align-items-center flex-column h-100'
			>
				<span className='display-4'>
					<BsFillChatSquareTextFill className='me-2'/>
					DokChat
				</span>
				<span className='mt-4 fs-5'>
					Loading...
				</span>
			</div>
		</div>
	);
}
