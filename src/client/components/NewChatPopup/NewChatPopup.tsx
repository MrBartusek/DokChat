import { Axios, AxiosError } from 'axios';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Form } from 'react-bootstrap';
import Alert from 'react-bootstrap/Alert';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';
import { BsPlus } from 'react-icons/bs';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User } from '../../../types/common';
import { ChatCreateResponse, EndpointResponse, UserGetResponse } from '../../../types/endpoints';
import { MessageManagerContext } from '../../context/MessageManagerContext';
import { UserContext } from '../../context/UserContext';
import getAxios from '../../helpers/axios';
import { useFetch } from '../../hooks/useFetch';
import { useForm } from '../../hooks/useForm';
import { LocalChat } from '../../types/Chat';
import IconButton from '../IconButton/IconButton';
import InteractiveButton from '../InteractiveButton/InteractiveButton';
import UserList from '../UserList/UserList';

function NewChatPopup() {
	const navigate = useNavigate();
	const [ participants, setParticipants ] = useState<(User)[]>([]);
	const [ isLoading, setLoading ] = useState(false);
	const [ values, handleChange, setValues ] = useForm({ username: '', tag: '' });
	const [ error, setError ] = useState(null);
	const [ user ] = useContext(UserContext);
	const [ chats, sendMessage, setChatList ] = useContext(MessageManagerContext);
	const formRef = useRef(null);

	const handleClose = () => navigate('/chat');

	function handleChangeNumeric(event: any) {
		event.target.value = event.target.value.replace(/[^0-9]/g, '');
		handleChange(event);
	}

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

		setValues();
		setError(null);
		setLoading(true);
		return await axios.get(`/user/get?username=${username}&tag=${tag}`)
			.then((r) => {
				const resp: EndpointResponse<UserGetResponse> = r.data;
				const participantsCopy = [ ...participants ];
				participantsCopy.push(resp.data);
				setParticipants(participantsCopy);
				return resp.data;
			})
			.catch((error: AxiosError) => {
				if(error.response.status == 404) {
					setError(`User ${username}#${tag} was not found`);
				}
				else {
					setError('Failed to add this user');
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
				navigate(`/chat/${resp.data.id}`);
			}).catch((e) => {
				console.error('Chat create error' + e);
				setError('Something went wrong');
				setLoading(false);
			});
	}

	return (
		<Modal show={true} onHide={handleClose}>
			<Modal.Header closeButton>
				<Modal.Title as={'div'}>
					Start a new conversation
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
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
								minLength={5}
								required
							/>
							<InputGroup.Text>#</InputGroup.Text>
							<Form.Control
								type="text"
								name="tag"
								style={{maxWidth: 63}}
								placeholder={'0000'}
								value={values.tag}
								onChange={handleChangeNumeric}
								pattern=".{4}"
								maxLength={4}
								minLength={4}
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
			</Modal.Body>
			<Modal.Footer>
				<InteractiveButton
					variant="primary"
					type="submit"
					onClick={handleSubmit}
					loading={isLoading}
				>
					Create a new {participants.length < 2 ? 'chat' : 'group'}
				</InteractiveButton>
			</Modal.Footer>
		</Modal>
	);
}

export default NewChatPopup;
