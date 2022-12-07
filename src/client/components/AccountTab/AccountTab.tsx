import React from 'react';
import { BsShieldLock, BsUnlockFill } from 'react-icons/bs';
import DeleteAccountButton from '../DeleteAccountButton/DeleteAccountButton';
import InteractiveButton from '../InteractiveButton/InteractiveButton';
import LogoutButton from '../LogoutButton/LogoutButton';
import './AccountTab.scss';

export default function AccountTab() {
	return (
		<div className='d-flex flex-column'>
			<SettingsRow
				title="Password and Authentication"
			>
				<>
					<InteractiveButton variant='primary' size='sm' icon={BsShieldLock}>
						Change Password
					</InteractiveButton>
					<p className='small fw-bold text-danger mt-4 mb-2'>
						<BsUnlockFill className='me-1'/>
						Two-factor authentication disabled
					</p>
					<p className='small text-muted mb-2'>
						Two-factor authentication (2FA for short) is added security layer for your DokChat account.
						When 2FA is enabled you need to confirm every login attempt.
					</p>
					<InteractiveButton variant='primary' size='sm' icon={BsShieldLock}>
						Enable 2FA
					</InteractiveButton>
				</>
			</SettingsRow>
			<SettingsRow
				title="Log Out"
				description="Logout from this DokChat account."
			>
				<LogoutButton size='sm' variant='primary'/>
			</SettingsRow>
			<SettingsRow
				title="Account Removal"
				description="Permanently delete this DokChat account. This action is not reversible."
			>
				<DeleteAccountButton size='sm' />
			</SettingsRow>
		</div>
	);
}

interface SettingsRowProps {
	title: string,
	description?: string,
	children?: JSX.Element;
}

function SettingsRow({ title, description, children}: SettingsRowProps) {
	return (
		<div className='account-settings-row'>
			<div className='lead fs-4 mb-2'>{title}</div>
			{ description && (<p className='small text-muted'>{description}</p>)}
			{children}
		</div>
	);
}
