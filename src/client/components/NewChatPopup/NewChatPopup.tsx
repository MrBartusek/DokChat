import { Axios, AxiosError } from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import Alert from 'react-bootstrap/Alert';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';
import { BsPlus } from 'react-icons/bs';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User } from '../../../types/common';
import { EndpointResponse, UserGetResponse } from '../../../types/endpoints';
import { UserContext } from '../../context/UserContext';
import getAxios from '../../helpers/axios';
import { useFetch } from '../../hooks/useFetch';
import { useForm } from '../../hooks/useForm';
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

	const handleClose = () => navigate('/chat');

	function handleChangeNumeric(event: any) {
		event.target.value = event.target.value.replace(/[^0-9]/g, '');
		handleChange(event);
	}

	function handleUserAdd(e: any) {
		e.preventDefault();
		const axios = getAxios(user);

		const username = values.username;
		const tag = values.tag;

		setValues();
		setError(null);
		setLoading(true);
		axios.get(`/user/get?username=${username}&tag=${tag}`)
			.then((r) => {
				const resp: EndpointResponse<UserGetResponse> = r.data;
				if(resp.status == 404) return setError(`User ${username}#${tag} was not found`);
				const participantsCopy = [ ...participants ];
				participantsCopy.push(resp.data);
				setParticipants(participantsCopy);
			})
			.catch(() => {
				setError('Failed to add this user');

			})
			.finally(() => {
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
				<Form onSubmit={handleUserAdd} className="mt-2">
					<Form.Group className='d-flex flex-row'>
						<InputGroup className='me-2'>
							<Form.Control
								type="text"
								name="username"
								placeholder={'DokChat User'}
								required
								maxLength={32}
								value={values.username}
								onChange={handleChange}
							/>
							<InputGroup.Text>#</InputGroup.Text>
							<Form.Control
								type="text"
								name="tag"
								maxLength={4}
								style={{maxWidth: 63}}
								placeholder={'0000'}
								required
								value={values.tag}
								onChange={handleChangeNumeric}
							/>
						</InputGroup>
						<IconButton
							icon={BsPlus}
							disabled={isLoading}
						/>
					</Form.Group>
					{error && <span className='text-danger'>This user was not found</span>}
				</Form>
			</Modal.Body>
			<Modal.Footer>
				<InteractiveButton
					variant="primary"
					type="submit"
					onClick={handleClose}
					loading={isLoading}
					disabled={participants.length == 0}
				>
					Create a new {participants.length < 2 ? 'chat' : 'group'}
				</InteractiveButton>
			</Modal.Footer>
		</Modal>
	);
}

export default NewChatPopup;
