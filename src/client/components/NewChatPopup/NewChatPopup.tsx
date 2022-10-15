import React, { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import Alert from 'react-bootstrap/Alert';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';
import { BsPlus } from 'react-icons/bs';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User } from '../../../types/common';
import { EndpointResponse } from '../../../types/endpoints';
import { useFetch } from '../../hooks/useFetch';
import { useForm } from '../../hooks/useForm';
import IconButton from '../IconButton/IconButton';
import InteractiveButton from '../InteractiveButton/InteractiveButton';
import UserList from '../UserList/UserList';

interface Participant {
	username?: string,
	tag?: string,
	id?: string
}

function NewChatPopup() {
	const navigate = useNavigate();
	const [ searchParams ] = useSearchParams();
	const participantsRaw = searchParams.get('participants');
	const [ participants, setParticipants ] = useState<(Participant | User)[]>(praseParticipants(participantsRaw));
	const [ isLoading, setLoading ] = useState(false);
	const [ values, handleChange, setValues ] = useForm({ username: '', tag: '' });
	const [ isError, setError ] = useState(false);

	const userCheck = useFetch<EndpointResponse<User>>(null, true);
	const handleClose = () => navigate('/chat');

	function handleChangeNumeric(event: any) {
		event.target.value = event.target.value.replace(/[^0-9]/g, '');
		handleChange(event);
	}

	function handleUserAdd(e: any) {
		e.preventDefault();
		setError(false);
		userCheck.setUrl(`/user/get?username=${values.username}&tag=${values.tag}`);
		setValues();
	}

	/**
	 * Grab data from user check
	 */
	useEffect(() => {
		if(userCheck.loading) return;
		if(userCheck.error) return setError(true);
		if(!userCheck.res) return;

		const participantsCopy = [ ...participants ];
		participantsCopy.push(userCheck.res.data);
		setParticipants(participantsCopy);
	}, [ userCheck ]);

	/**
	 * Synchronize loading
	 */
	useEffect(() => {
		setLoading(userCheck.loading);
	}, [ userCheck.loading ]);

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
					{isError && <span className='text-danger'>This user was not found</span>}
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

function praseParticipants(raw: string | null) : Participant[] {
	if(raw == null) return [];
	const participants = raw.split(',');
	for(const part of participants) {
		// If any participant is invalid don't return any
		if(isNaN(Number(part))) return [];
	}
	return participants.map(p => ({id: p}));
}

export default NewChatPopup;
