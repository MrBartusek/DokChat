import React, { useEffect, useState } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { useOutletContext } from 'react-router-dom';
import { LocalChat } from '../../types/Chat';
import AccountTab from '../AccountTab/AccountTab';
import ChatParticipantsTab from '../ChatParticipantsTab/ChatParticipantsTab';
import ChatPrivacyTab from '../ChatPrivacyTab/ChatPrivacyTab';
import ChatSettingsTab from '../ChatSettingsTab/ChatSettingsTab';
import InteractiveButton from '../InteractiveButton/InteractiveButton';
import Popup from '../Popup/Popup';
import ProfileSettingsTab from '../ProfileSettingsTab/ProfileSettingsTab';
import SettingsTab from '../SettingsTab/SettingsTab';

function ChatDetailsPopup() {
	const currentChat = useOutletContext<LocalChat>();
	const [ handleClose, setHandleClose ] = useState<() => void>(null);
	const [ customFooter, setCustomFooter ] = useState<JSX.Element>(null);
	const [ customStatic, setCustomStatic ] = useState<boolean>(null);
	const [ popupTitle, setPopupTitle ] = useState('');
	const [ key, setKey ] = useState('chat');

	useEffect(() => {
		if(key == 'chat') {
			setPopupTitle('Chat');
		}
		else if(key == 'participants') {
			setPopupTitle('Participants');
		}
		else if(key == 'privacy') {
			setPopupTitle('Privacy');
		}
		setCustomFooter(null);
		setCustomStatic(false);
	}, [ key ]);

	if(!currentChat) return null;

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
				id="chat-tabs"
				activeKey={key}
				onSelect={(k) => setKey(k)}
			>
				<Tab eventKey="chat" title="Chat" className='pt-4' disabled={customStatic}>
					<ChatSettingsTab
						currentChat={currentChat}
						setCustomFooter={setCustomFooter}
						setCustomStatic={setCustomStatic}
						handleClose={handleClose}
					/>
				</Tab>
				<Tab eventKey="participants" title="Participants" className='pt-4' disabled={customStatic}>
					<ChatParticipantsTab />
				</Tab>
				<Tab eventKey="privacy" title="Privacy" className='pt-4' disabled={customStatic}>
					<ChatPrivacyTab currentChat={currentChat} />
				</Tab>
			</Tabs>
		</Popup>
	);
}

export default ChatDetailsPopup;
