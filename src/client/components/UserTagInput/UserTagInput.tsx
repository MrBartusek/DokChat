import React, { FormEvent, Ref, useContext, useRef, useState } from 'react';
import { Form } from 'react-bootstrap';
import InputGroup from 'react-bootstrap/InputGroup';
import { BsPlus } from 'react-icons/bs';
import { User } from '../../../types/common';
import { EndpointResponse, UserGetResponse } from '../../../types/endpoints';
import { UserContext } from '../../context/UserContext';
import getAxios from '../../helpers/axios';
import { useForm } from '../../hooks/useForm';
import IconButton from '../IconButton/IconButton';

export interface UserTagInputProps {
	onAdd: ((user: User) => any);
}

const UserTagInput = React.forwardRef(({ onAdd }: UserTagInputProps, ref: Ref<HTMLFormElement>) => {
	const [values, handleChange, clearValues] = useForm({ username: '', tag: '' });
	const [isLoading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [user] = useContext(UserContext);
	const usernameRef = useRef<HTMLInputElement>(null);
	const tagRef = useRef<HTMLInputElement>(null);

	async function onSubmit(e: FormEvent) {
		e.preventDefault();

		const axios = getAxios(user);
		const username = values.username;
		const tag = values.tag;

		if (username == user.username && tag == user.tag) {
			setError('You can\'t add yourself to the new chat');
			return;
		}

		setError(null);
		setLoading(true);
		await axios.get(`/user/get?username=${username}&tag=${tag}`)
			.then((r) => {
				const resp: EndpointResponse<UserGetResponse> = r.data;
				onAdd(resp.data);
				clearValues();
			})
			.catch((error) => {
				if (error.response.status == 404) {
					setError(`User ${username}#${tag} was not found`);
				}
				else {
					const resp: EndpointResponse<null> = error.response?.data;
					setError(resp?.message || 'Failed to add this user');
				}
			})
			.finally(() => {
				setLoading(false);
			});
	}

	function handleChangeWrapper(event: React.ChangeEvent<HTMLInputElement>) {
		if (event.target == usernameRef.current) {
			const nativeEvent = event.nativeEvent as InputEvent;
			if (nativeEvent.inputType == 'insertText' && nativeEvent.data == '#') {
				tagRef.current.focus();
				return;
			}
		}
		handleChange(event);
	}

	return (
		<Form className="mt-2" onSubmit={onSubmit} ref={ref}>
			<Form.Group className='d-flex flex-row'>
				<InputGroup className='me-2'>
					<Form.Control
						type="text"
						name="username"
						ref={usernameRef}
						placeholder={'DokChat User'}
						value={values.username}
						onChange={handleChangeWrapper}
						maxLength={32}
						minLength={2}
						required
					/>
					<InputGroup.Text>#</InputGroup.Text>
					<Form.Control
						type="number"
						name="tag"
						ref={tagRef}
						style={{ maxWidth: 63 }}
						placeholder={'0000'}
						value={values.tag}
						onChange={handleChangeWrapper}
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
	);
});

UserTagInput.displayName = 'UserTagInput';

export default UserTagInput;
