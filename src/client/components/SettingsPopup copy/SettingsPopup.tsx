import React, { useEffect, useState } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import AccountTab from '../AccountTab/AccountTab';
import InteractiveButton from '../InteractiveButton/InteractiveButton';
import Popup from '../Popup/Popup';
import ProfileSettings from '../ProfileSettingsTab/ProfileSettingsTab';
import SettingsTab from '../SettingsTab/SettingsTab';

function SettingsPopup() {
	const [ handleClose, setHandleClose ] = useState<() => void>(null);
	const [ customFooter, setCustomFooter ] = useState<JSX.Element>(null);
	const [ customStatic, setCustomStatic ] = useState<boolean>(null);
	const [ popupTitle, setPopupTitle ] = useState('');
	const [ key, setKey ] = useState('profile');

	useEffect(() => {
		if(key == 'profile') {
			setPopupTitle('Profile');
		}
		else if(key == 'account') {
			setPopupTitle('My Account');
		}
		else if(key == 'settings') {
			setPopupTitle('Settings');
		}
		setCustomFooter(null);
		setCustomStatic(false);
	}, [ key ]);

	return (
		<Popup
			title={popupTitle}
			footer={customFooter ?? (
				<InteractiveButton variant='primary' onClick={handleClose}>
					Close
				</InteractiveButton>
			)}
			setHandleClose={setHandleClose}
			static={customStatic}
		>
			<Tabs
				id="controlled-tab-example"
				activeKey={key}
				onSelect={(k) => setKey(k)}
			>
				<Tab eventKey="profile" title="Profile" className='pt-4' disabled={customStatic}>
					<ProfileSettings
						setCustomFooter={setCustomFooter}
						setCustomStatic={setCustomStatic}
						handleClose={handleClose}
					/>
				</Tab>
				<Tab eventKey="account" title="My Account" className='pt-4' disabled={customStatic}>
					<AccountTab />
				</Tab>
				<Tab eventKey="settings" title="Settings" className='pt-4' disabled={customStatic}>
					<SettingsTab />
				</Tab>
			</Tabs>
		</Popup>
	);
}

export default SettingsPopup;
