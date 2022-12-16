import React, { useContext, useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { EndpointResponse } from '../../../types/endpoints';
import { MessageManagerContext } from '../../context/MessageManagerContext';
import { UserContext } from '../../context/UserContext';
import getAxios from '../../helpers/axios';
import { LocalChat } from '../../types/Chat';
import InteractiveButton from '../InteractiveButton/InteractiveButton';
import Popup from '../Popup/Popup';

function GroupLeavePopup() {
	const currentChat = useOutletContext<LocalChat>();
	const [ handleClose, setHandleClose ] = useState<() => void>(null);
	const [ isLoading, setLoading ] = useState(false);
	const [ error, setError ] = useState<string | null>(null);
	const [ user ] = useContext(UserContext);
	const [ chats, sendMessage, setChatList ] = useContext(MessageManagerContext);
	const navigate = useNavigate();

	useEffect(() => {
		if(!currentChat.isGroup) navigate(`/chat/${currentChat.id}`);
	}, [ currentChat ]);

	async function handleLeave() {
		const axios = getAxios(user);

		setLoading(true);
		await axios.post('chat/leave', { chat: currentChat.id })
			.then(() => {
				const chatsCopy = [ ...chats ];
				setChatList(chatsCopy.filter(c => c.id !== currentChat.id));
				navigate('/chat');
			})
			.catch((error) => {
				const resp: EndpointResponse<null> = error.response?.data;
				setError(resp?.message || 'Failed to leave this chat at this time. Please try again later.');
				setLoading(false);
			});
	}

	return (
		<Popup
			title="Leave group"
			footer={(
				<>
					<InteractiveButton variant='secondary' onClick={handleClose} disabled={isLoading}>
						Cancel
					</InteractiveButton>
					<InteractiveButton variant='danger' onClick={handleLeave} loading={isLoading}>
						Leave group
					</InteractiveButton>
				</>
			)}
			setHandleClose={setHandleClose}
			static={isLoading}
		>
			<>
				{error && <Alert variant='danger'>{error}</Alert>}
				<p>
					You are about to leave <b>{currentChat.name}</b>. This group will be deleted from
					your chat list. To join once again you will need an invite.
				</p>
			</>
		</Popup>
	);
}

export default GroupLeavePopup;
