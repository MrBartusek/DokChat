import React, { useContext } from 'react';
import { BsPersonExclamation } from 'react-icons/bs';
import { UserContext } from '../../context/UserContext';

export interface DemoInfoProps {
    message?: string;
}

export default function DemoInfo({ message }: DemoInfoProps) {
	const [ user ] = useContext(UserContext);

	if(!user.isDemo) return null;

	return (
		<div className='d-flex align-items-center border border-danger rounded-3 p-3 mt-1'>
			<div>
				<BsPersonExclamation color='var(--bs-danger)' size='1.7em' className='me-3' />
			</div>
			<div className='pt-1 text-secondary'>
				{message ?? 'This feature is not available while using the demo account.'}
			</div>
		</div>

	);
}
