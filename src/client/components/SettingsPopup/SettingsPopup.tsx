import { AxiosError } from 'axios';
import React, { FormEvent, useContext, useEffect, useRef, useState } from 'react';
import { Alert, Button, FloatingLabel, Form, FormControlProps } from 'react-bootstrap';
import { BsPencil } from 'react-icons/bs';
import { EndpointResponse } from '../../../types/endpoints';
import { UserContext } from '../../context/UserContext';
import getAxios from '../../helpers/axios';
import { useForm } from '../../hooks/useForm';
import CopyButton from '../CopyButton/CopyButton';
import IconButton from '../IconButton/IconButton';
import InteractiveButton from '../InteractiveButton/InteractiveButton';
import Popup from '../Popup/Popup';
import ProfilePicture from '../ProfilePicture/ProfilePicture';

function SettingsPopup() {
	const [ user, updateToken ] = useContext(UserContext);
	const [ handleClose, setHandleClose ] = useState<() => void>(null);
	const [ isEditing, setEditing ] = useState(false);
	const [ isUnsaved, setUnsaved ] = useState(false);
	const defaultValues = { username: user.username, tag: user.tag, email: user.email, password: ''};
	const [ values, handleChange ] = useForm(defaultValues);
	const [ error, setError ] = useState<string | null>(null);
	const [ isLoading, setLoading ] = useState(false);
	const formRef = useRef<HTMLFormElement>(null);

	/**
	 * Handle isUnsaved hook
	 */
	useEffect(() => {
		const changed = (
			values.username != defaultValues.username ||
			values.tag != defaultValues.tag ||
			values.email != defaultValues.email
		);
		setUnsaved(changed);
	}, [ values ]);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setLoading(true);

		await getAxios(user).put('/user/update-profile', values)
			.then(() => updateToken())
			.then(() => handleClose())
			.catch((e) => {
				const resp: EndpointResponse<null> = e.response?.data;
				setError(resp?.message || 'Failed to update profile at this time. Please try again later.');
				setLoading(false);
			});
	}

	return (
		<Popup
			title="Your profile"
			footer={(
				<>
					{isEditing ? (
						<>
							<Button variant='secondary' onClick={handleClose}>
								Close
							</Button>
							<InteractiveButton
								variant='primary'
								onClick={() => formRef.current.requestSubmit()}
								disabled={!isUnsaved}
								loading={isLoading}
							>
								Save Changes
							</InteractiveButton>
						</>

					) : (
						<Button variant='primary' onClick={handleClose}>
							Close
						</Button>
					)}
				</>
			)}
			setHandleClose={setHandleClose}
			static={isUnsaved}
		>
			<div className='d-flex align-items-center flex-column me-2'>
				<ProfilePicture src={user.avatarUrl} size={80}/>
				<span className='lead fw-bold mt-2 d-flex align-items-center'>
					<span className='mx-1' style={{paddingLeft: 32}}>
						{user.username}
						<span className="text-muted">#{user.tag}</span>
					</span>
					<CopyButton copyText={user.discriminator} />
				</span>
				<p className="text-muted">
					Online
				</p>
			</div>

			{error && <Alert variant='danger'>{error}</Alert>}

			<Form ref={formRef} onSubmit={handleSubmit}>
				<div className="position-relative">
					{!isEditing && (
						<IconButton
							icon={BsPencil}
							className="position-absolute top-p end-0 mt-2"
							style={{zIndex: 1}}
							size={34}
							onClick={() => setEditing(true)}
						/>
					)}

				</div>

				<FloatingLabel label={'Username'} className="mb-2">
					<SettingsOption
						type="text"
						name="username"
						value={values.username}
						onChange={handleChange}
						readOnly={!isEditing}
						required
						maxLength={32}
						minLength={2}
					/>
				</FloatingLabel>
				<FloatingLabel label={'User tag'} className="mb-2">
					<SettingsOption
						type="number"
						name="tag"
						value={values.tag}
						onChange={handleChange}
						readOnly={!isEditing}
						required
						maxLength={4}
						minLength={4}
						pattern="\d{4}"

					/>
				</FloatingLabel>
				<FloatingLabel label={'E-mail address'} className="mb-2">
					<SettingsOption
						type="email"
						name="email"
						value={isEditing ? values.email : user.emailMasked}
						onChange={handleChange}
						readOnly={!isEditing}
						required
					/>
				</FloatingLabel>
				{isEditing && (
					<FloatingLabel label={'Confirm your password'}>
						<SettingsOption
							type="password"
							name="password"
							value={values.password}
							onChange={handleChange}
							required
						/>
					</FloatingLabel>
				)}
			</Form>
		</Popup>
	);
}

function SettingsOption(props: FormControlProps & React.AllHTMLAttributes<HTMLInputElement>) {
	const propsCopy = Object.assign({}, props);
	if(propsCopy.readOnly) {
		propsCopy.className = ' form-control-plaintext';
		propsCopy.onFocus = (e) => e.target.blur();
	}
	return (
		<Form.Control {...propsCopy}/>
	);
}

export default SettingsPopup;