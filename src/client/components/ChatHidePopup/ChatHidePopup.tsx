import React, { useContext, useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { EndpointResponse } from '../../../types/endpoints';
import { MessageManagerContext } from '../../context/MessageManagerContext';
import { UserContext } from '../../context/UserContext';
import getAxios from '../../helpers/axios';
import { LocalChat } from '../../types/Chat';
import InteractiveButton from '../InteractiveButton/InteractiveButton';
import Popup from '../Popup/Popup';

function ChatHidePopup() {
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

	async function handleHide() {
		const axios = getAxios(user);

		setLoading(true);
		await axios.post('chat/hide', { chat: currentChat.id })
			.then(() => {
				const chatsCopy = [ ...chats ];
				setChatList(chatsCopy.filter(c => c.id !== currentChat.id));
				toast('This chat has been hidden');
				navigate('/chat');
			})
			.catch((error) => {
				const resp: EndpointResponse<null> = error.response?.data;
				setError(resp?.message || 'Failed to hide this chat at this time. Please try again later.');
				setLoading(false);
			});
	}

	return (
		<Popup
			title="Hide chat"
			footer={(
				<>
					<InteractiveButton variant='secondary' onClick={handleClose} disabled={isLoading}>
						Cancel
					</InteractiveButton>
					<InteractiveButton variant='primary' onClick={handleHide} loading={isLoading}>
						Hide chat
					</InteractiveButton>
				</>
			)}
			setHandleClose={setHandleClose}
			static={isLoading}
		>
			<>
				{error && <Alert variant='danger'>{error}</Alert>}
				<p>
					You are about to temporarily hide <b>{currentChat.name}</b>. This chat will be hidden from
					your chat list. You will still receive notifications about new messages.
				</p>
			</>
		</Popup>
	);
}

export default ChatHidePopup;
