import React from 'react';
import { BsFillChatSquareTextFill } from 'react-icons/bs';
import './MainLoading.scss';
import { Spinner } from 'react-bootstrap';
import DokChatLogo from '../DokChatLogo/DokChatLogo';
import Utils from '../../helpers/utils';
import { useSettings } from '../../hooks/useSettings';

export interface MainLoadingProps {
	noLogo?: boolean;
}

export default function MainLoading({ noLogo }: MainLoadingProps) {
	return (
		<div className='mainLoading'>
			{!noLogo ? (
				<div
					className='d-flex justify-content-center align-items-center flex-column h-100'
				>
					<DokChatLogo variant='auto' height={100} className='pb-3' />
					<Spinner animation="border" variant='secondary' role="status" aria-hidden="true" />
				</div>
			): null}

		</div>
	);
}
