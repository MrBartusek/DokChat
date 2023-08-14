import React, { useContext } from 'react';
import InteractiveButton from '../InteractiveButton/InteractiveButton';
import { BsShieldLock, BsUnlockFill } from 'react-icons/bs';

export default function SecurityOptions() {

	return (
		<>
			<div className='text-muted pb-3'>
				Security options are not yet implemented. See {' '}
				<a href="https://github.com/MrBartusek/DokChat/issues/10">#10</a> and {' '}
				<a href="https://github.com/MrBartusek/DokChat/issues/29">#29</a>
			</div>
			<div className='opacity-25 pointer-event'>
				<InteractiveButton variant='primary' size='sm' icon={BsShieldLock}>
					Change Password
				</InteractiveButton>
				<p className='small fw-bold text-danger mt-4 mb-2'>
					<BsUnlockFill className='me-1' />
					Two-factor authentication disabled
				</p>
				<p className='small text-muted mb-2'>
					Two-factor authentication (2FA for short) is added security layer for your DokChat account.
					When 2FA is enabled you need to confirm every login attempt.
				</p>
				<InteractiveButton variant='primary' size='sm' icon={BsShieldLock}>
					Enable 2FA
				</InteractiveButton>
			</div>
		</>
	);
}
