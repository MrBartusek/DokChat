import React, { useContext } from 'react';
import { BsShieldLock, BsUnlockFill } from 'react-icons/bs';
import DeleteAccountButton from '../DeleteAccountButton/DeleteAccountButton';
import InteractiveButton from '../InteractiveButton/InteractiveButton';
import LogoutButton from '../LogoutButton/LogoutButton';
import './AccountTab.scss';
import { UserContext } from '../../context/UserContext';
import DemoInfo from '../DemoInfo/DemoInfo';
import SecurityOptions from '../SecurityOptions/SecurityOptions';

export default function AccountTab() {
	const [ user ] = useContext(UserContext);

	return (
		<div className='d-flex flex-column'>
			<SettingsRow
				title="Password and Authentication"
			>
				{!user.isDemo ? <SecurityOptions /> : <DemoInfo />}
			</SettingsRow>
			<SettingsRow
				title="Log Out"
				description="Logout from this DokChat account."
			>
				<LogoutButton size='sm' variant='primary' />
			</SettingsRow>
			<SettingsRow
				title="Account Removal"
				description="Permanently delete this DokChat account. This action is not reversible."
			>
				{!user.isDemo
					? <DeleteAccountButton size='sm' />
					: <DemoInfo />}
			</SettingsRow>
		</div>
	);
}

interface SettingsRowProps {
	title: string,
	description?: string,
	children?: React.ReactNode;
}

function SettingsRow({ title, description, children }: SettingsRowProps) {
	return (
		<div className='account-settings-row'>
			<div className='lead fs-4 mb-2'>{title}</div>
			{description && (<p className='small text-muted'>{description}</p>)}
			{children}
		</div>
	);
}
