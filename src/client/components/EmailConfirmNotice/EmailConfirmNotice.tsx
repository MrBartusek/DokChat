import React, { useContext, useState } from 'react';
import { Button, CloseButton } from 'react-bootstrap';
import { BsExclamationTriangle } from 'react-icons/bs';
import { UserContext } from '../../context/UserContext';
import Separator from '../Separator/Separator';

export default function EmailConfirmNotice() {
	const [ user ] = useContext(UserContext);
	const [ show, setShow ] = useState(true);

	if(!show) return <></>;
	return (
		<div className='p-2 bg-warning d-flex justify-content-center align-items-center'>
			<Separator width={24} />
			<div className='d-flex justify-content-center align-items-center w-100'>
				<BsExclamationTriangle className='me-2' />
				<span className='me-3'>
				You haven&apos;t confirmed your e-mail address (<b>{user.emailMasked}</b>) yet
				</span>
				<Button variant='outline-dark' size='sm' className='rounded-3'>
				Confirm
				</Button>
			</div>
			<CloseButton onClick={() => setShow(false)}/>
		</div>
	);
}
