import React, { useContext } from 'react';
import InteractiveButton from '../InteractiveButton/InteractiveButton';
import { BsLockFill, BsShieldLock, BsUnlockFill } from 'react-icons/bs';
import { UserContext } from '../../context/UserContext';
import { Link } from 'react-router-dom';

export default function SecurityOptions() {
	const [ user ] = useContext(UserContext);

	return (
		<>
			{!user.hasPassword && (
				<p className='small text-danger mb-2'>
					<BsUnlockFill className='me-1' /> This account has been created using 3rd-party Login Provider. Please create
					a password for this account.
				</p>
			)}
			<InteractiveButton variant='primary' size='sm' icon={BsShieldLock}>
				{user.hasPassword ? 'Change' : 'Set'} Password
			</InteractiveButton>
			<p className={`small fw-bold mt-4 mb-2 ${user.is2FAEnabled ? 'text-success' : 'text-danger'}`}>
				{user.is2FAEnabled ? <BsLockFill className='me-1' /> : <BsUnlockFill className='me-1' />}
				Two-factor authentication {user.is2FAEnabled ? 'enabled' : 'disabled'}
			</p>
			<p className='small text-muted mb-2'>
				Two-factor authentication (2FA for short) is added security layer for your DokChat account.
				When 2FA is enabled you need to confirm every login attempt.
			</p>
			<Link to='2fa'>
				<InteractiveButton icon={BsShieldLock} size='sm'>
					{user.is2FAEnabled ? 'Disable' : 'Enable'} 2FA
				</InteractiveButton>
			</Link>
		</>
	);
}
