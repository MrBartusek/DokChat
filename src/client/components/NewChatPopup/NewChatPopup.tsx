import { AxiosError } from 'axios';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import InputGroup from 'react-bootstrap/InputGroup';
import toast from 'react-hot-toast';
import { BsPlus } from 'react-icons/bs';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User } from '../../../types/common';
import { ChatCreateResponse, EndpointResponse, UserGetResponse } from '../../../types/endpoints';
import { MessageManagerContext } from '../../context/MessageManagerContext';
import { UserContext } from '../../context/UserContext';
import getAxios from '../../helpers/axios';
import { useForm } from '../../hooks/useForm';
import { LocalChat } from '../../types/Chat';
import IconButton from '../IconButton/IconButton';
import InteractiveButton from '../InteractiveButton/InteractiveButton';
import Popup from '../Popup/Popup';
import UserList from '../UserList/UserList';

function NewChatPopup() {
	const navigate = useNavigate();
	const [ participants, setParticipants ] = useState<(User)[]>([]);
	const [ searchParams ] = useSearchParams({});
	const [ isLoading, setLoading ] = useState(false);
	const [ values, handleChange, setValues ] = useForm({ username: '', tag: '' });
	const [ error, setError ] = useState(null);
	const [ user ] = useContext(UserContext);
	const [ chats, sendMessage, setChatList ] = useContext(MessageManagerContext);
	const formRef = useRef(null);
	const [ handleClose, setHandleClose ] = useState<() => void>(null);

	useEffect(() => {
		const id = searchParams.get('prefill');
		if(!id) return;
		setLoading(true);
		const axios = getAxios(user);
		axios.get(`/user/get?id=${id}`)
			.then((r) => {
				const resp: EndpointResponse<UserGetResponse> = r.data;
				const participantsCopy = [ ...participants ];
				participantsCopy.push(resp.data);
				setParticipants(participantsCopy);
			})
			.catch(() => {
				setError('Failed to load pre-filled user');
			})
			.finally(() => setLoading(false));
	}, [ searchParams ]);

	async function handleUserAdd(e?: any): Promise<User | null> {
		e?.preventDefault();

		// This is additional form validity check, if this function is not called
		// from regular HTML event
		const valid = formRef.current.checkValidity();
		if(!valid) {
			formRef.current.reportValidity();
			return null;
		}

		const axios = getAxios(user);
		const username = values.username;
		const tag = values.tag;

		if(username == user.username && tag == user.tag) {
			setError('You can\'t add yourself to the new chat');
			return;
		}

		setError(null);
		setLoading(true);
		return await axios.get(`/user/get?username=${username}&tag=${tag}`)
			.then((r) => {
				const resp: EndpointResponse<UserGetResponse> = r.data;
				const participantsCopy = [ ...participants ];
				participantsCopy.push(resp.data);
				setParticipants(participantsCopy);
				setValues();
				return resp.data;
			})
			.catch((error) => {
				if(error.response.status == 404) {
					setError(`User ${username}#${tag} was not found`);
				}
				else {
					const resp: EndpointResponse<null> = error.response?.data;
					setError(resp?.message || 'Failed to add this user');
				}
				return null;

			})
			.finally(() => {
				setLoading(false);
			});
	}

	async function handleSubmit() {
		// If user just typed the discriminator and didn't
		// press the + button, do it for them
		let participantsCopy = participants;
		if(participantsCopy.length == 0) {
			const userAdded = await handleUserAdd();
			if(!userAdded) return;
			participantsCopy = [ userAdded ];
		}

		setLoading(true);
		const axios = getAxios(user);
		await axios.post('/chat/create', {
			participants: participantsCopy.map(p => p.id)
		}, {
			validateStatus: (s) => [ 200, 409 ].includes(s)
		})
			.then((r) => {
				const resp: EndpointResponse<ChatCreateResponse> = r.data;
				const chatsCopy = [ ...chats ];
				const chatExist = chatsCopy.find(c => c.id == resp.data.id);
				if(!chatExist) {
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
			<p className='text-center'>
					Insert one or more pair of username and tag to start a new conversation or create a group.
			</p>
			<UserList users={participants}/>
			<Form className="mt-2" onSubmit={handleUserAdd} ref={formRef}>
				<Form.Group className='d-flex flex-row'>
					<InputGroup className='me-2'>
						<Form.Control
							type="text"
							name="username"
							placeholder={'DokChat User'}
							value={values.username}
							onChange={handleChange}
							maxLength={32}
							minLength={2}
							required
						/>
						<InputGroup.Text>#</InputGroup.Text>
						<Form.Control
							type="number"
							name="tag"
							style={{maxWidth: 63}}
							placeholder={'0000'}
							value={values.tag}
							onChange={handleChange}
							maxLength={4}
							minLength={4}
							pattern="\d{4}"
							required
						/>
					</InputGroup>
					<IconButton
						icon={BsPlus}
						disabled={isLoading}
					/>
				</Form.Group>
				{error && <span className='text-danger'>{error}</span>}
			</Form>
		</Popup>
	);
}

export default NewChatPopup;
