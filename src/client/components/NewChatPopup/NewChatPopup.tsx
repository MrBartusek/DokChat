import { AxiosError } from 'axios';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Alert, Button } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User } from '../../../types/common';
import { ChatCreateResponse, EndpointResponse, UserGetResponse } from '../../../types/endpoints';
import { MessageManagerContext } from '../../context/MessageManagerContext';
import { UserContext } from '../../context/UserContext';
import getAxios from '../../helpers/axios';
import Utils from '../../helpers/utils';
import { usePageInfo } from '../../hooks/usePageInfo';
import { LocalChat } from '../../types/Chat';
import InteractiveButton from '../InteractiveButton/InteractiveButton';
import Popup from '../Popup/Popup';
import UserList from '../UserList/UserList';
import UserTagInput from '../UserTagInput/UserTagInput';

function NewChatPopup() {
	const navigate = useNavigate();
	const [ participants, setParticipants ] = useState<(User)[]>([]);
	const [ searchParams ] = useSearchParams({});
	const [ isLoading, setLoading ] = useState(false);
	const [ user ] = useContext(UserContext);
	const [ error, setError ] = useState(null);
	const [ chats, sendMessage, setChatList ] = useContext(MessageManagerContext);
	const [ handleClose, setHandleClose ] = useState<() => void>(null);
	const userAddRef = useRef<HTMLFormElement>(null);

	usePageInfo({
		title: 'New chat',
		discordTitle: 'Creating new chat'
	});

	useEffect(() => {
		const id = searchParams.get('prefill');
		if (!id) return;
		setLoading(true);
		const axios = getAxios(user);
		axios.get(`/user/get?id=${id}`)
			.then((r) => {
				const resp: EndpointResponse<UserGetResponse> = r.data;
				const participantsCopy = [ ...participants ];
				participantsCopy.push(resp.data);
				setParticipants(participantsCopy);
			})
			.catch(() => setError('Failed to load pre-filled user'))
			.finally(() => setLoading(false));
	}, [ searchParams ]);

	async function handleSubmit() {
		// If user just typed the discriminator and didn't
		// press the + button, do it for them
		if (participants.length == 0) {
			// HACK: submit and call onSubmit
			const form = userAddRef.current;
			const button = form.ownerDocument.createElement('button');
			button.style.display = 'none';
			button.type = 'submit';
			form.appendChild(button).click();
			form.removeChild(button);
			return;
		}

		setLoading(true);
		const axios = getAxios(user);
		await axios.post('/chat/create', {
			participants: participants.map(p => p.id)
		}, {
			validateStatus: (s) => [ 200, 409 ].includes(s)
		})
			.then((r) => {
				const resp: EndpointResponse<ChatCreateResponse> = r.data;
				const chatsCopy = [ ...chats ];
				const chatExist = chatsCopy.find(c => c.id == resp.data.id);
				if (!chatExist) {
					chatsCopy.push(new LocalChat(resp.data));
					setChatList(chatsCopy);
				}
				resp.status == 409 ?? toast('This chat already exist');
				navigate(`/chat/${resp.data.id}`);
			}).catch((e: AxiosError) => {
				const resp: EndpointResponse<ChatCreateResponse> = e.response?.data as any;
				setError(resp.message || 'Something went wrong');
				setLoading(false);
			});
	}

	async function onAdd(user: User) {
		if (participants.find(p => p.id == user.id)) {
			return setError(`${Utils.userDiscriminator(user)} is already on this list`);
		}
		setParticipants([ ...participants, user ]);
	}

	return (
		<Popup
			setHandleClose={setHandleClose}
			title="Start a new conversation"
			footer={(
				<>
					<Button variant='secondary' onClick={handleClose}>
						Close
					</Button>
					<InteractiveButton
						variant="primary"
						type="submit"
						onClick={handleSubmit}
						loading={isLoading}
					>
						Create a new {participants.length < 2 ? 'chat' : 'group'}
					</InteractiveButton>
				</>
			)}
		>
			{error && <Alert variant='danger'>{error}</Alert>}
			<p className='text-center'>
				Insert one or more pair of username and tag to start a new conversation or create a group.
			</p>
			<UserList users={participants} />
			<UserTagInput onAdd={onAdd} ref={userAddRef} />
		</Popup>
	);
}

export default NewChatPopup;
