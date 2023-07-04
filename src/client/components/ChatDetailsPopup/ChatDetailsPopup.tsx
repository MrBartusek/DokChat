import React, { useEffect, useState } from 'react';
import { Button, Tab, Tabs } from 'react-bootstrap';
import { BsPersonPlus } from 'react-icons/bs';
import { useOutletContext } from 'react-router-dom';
import { ChatParticipantsResponse, EndpointResponse } from '../../../types/endpoints';
import { useFetch } from '../../hooks/useFetch';
import { LocalChat } from '../../types/Chat';
import ChatInviteTab from '../ChatInviteTab/ChatInviteTab';
import ChatParticipantsTab from '../ChatParticipantsTab/ChatParticipantsTab';
import ChatPrivacyTab from '../ChatPrivacyTab/ChatPrivacyTab';
import ChatSettingsTab from '../ChatSettingsTab/ChatSettingsTab';
import InteractiveButton from '../InteractiveButton/InteractiveButton';
import Popup from '../Popup/Popup';

function ChatDetailsPopup() {
	const currentChat = useOutletContext<LocalChat>();
	const [ handleClose, setHandleClose ] = useState<() => void>(null);
	const [ customFooter, setCustomFooter ] = useState<JSX.Element>(null);
	const [ customStatic, setCustomStatic ] = useState<boolean>(null);
	const [ popupTitle, setPopupTitle ] = useState('');
	const [ key, setKey ] = useState('chat');
	const participants = useFetch<EndpointResponse<ChatParticipantsResponse>>(null, true);

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
		else if(key == 'invite') {
			setPopupTitle('Invite to group');
		}
		setCustomFooter(null);
		setCustomStatic(false);
	}, [ key ]);

	useEffect(() => {
		if(!currentChat) return;
		participants.setUrl(`chat/participants?chat=${currentChat.id}`);
	}, [ currentChat ]);

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
						participants={participants.res?.data || []}
						setCustomFooter={setCustomFooter}
						setCustomStatic={setCustomStatic}
						handleClose={handleClose}
					/>
				</Tab>
				<Tab eventKey="participants" title="Participants" className='pt-4' disabled={customStatic}>
					<ChatParticipantsTab currentChat={currentChat} participants={participants.res?.data || []} />
					{currentChat.isGroup && (
						<div className='d-grid'>
							<Button
								variant='outline-secondary'
								className='mt-3'
								onClick={() => setKey('invite')}
							>
								<BsPersonPlus className='me-2' /> Invite to this group
							</Button>
						</div>
					)}
				</Tab>
				{currentChat.isGroup && (
					<Tab eventKey="invite" title="Invite" className='pt-4' disabled={customStatic}>
						<ChatInviteTab currentChat={currentChat} />
					</Tab>
				)}
				<Tab eventKey="privacy" title="Privacy" className='pt-4' disabled={customStatic}>
					<ChatPrivacyTab currentChat={currentChat} participants={participants.res?.data || []} />
				</Tab>
			</Tabs>
		</Popup>
	);
}

export default ChatDetailsPopup;
