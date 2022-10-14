import React from 'react';
import { Spinner } from 'react-bootstrap';
import { BsFillChatSquareTextFill } from 'react-icons/bs';
import './MainLoading.scss';

export interface MainLoadingProps {
	hide?: boolean;
}

export default function MainLoading({ hide }: MainLoadingProps) {
	return (
		<div
			className={`mainLoading ${hide ? 'opacity-0' : 'opacity-1'}`}
		>
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
