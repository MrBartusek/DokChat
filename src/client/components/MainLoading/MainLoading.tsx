import React from 'react';
import { BsFillChatSquareTextFill } from 'react-icons/bs';
import './MainLoading.scss';
import { Spinner } from 'react-bootstrap';
import DokChatLogo from '../DokChatLogo/DokChatLogo';
import Utils from '../../helpers/utils';
import { useSettings } from '../../hooks/useSettings';

export default function MainLoading() {
	return (
		<div className='mainLoading'>
			<div
				className='d-flex justify-content-center align-items-center flex-column h-100'
			>
				<DokChatLogo variant='auto' height={100} className='pb-3' />
				<Spinner animation="border" variant='secondary' role="status" aria-hidden="true" />
			</div>
		</div>
	);
}
