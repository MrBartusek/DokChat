import React, {FormEvent, useContext, useEffect, useRef, useState } from 'react';
import { Button, FloatingLabel, Form, FormControlProps } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { BsPencil } from 'react-icons/bs';
import { useOutletContext } from 'react-router-dom';
import { EndpointResponse } from '../../../types/endpoints';
import { UserContext } from '../../context/UserContext';
import getAxios from '../../helpers/axios';
import { useForm } from '../../hooks/useForm';
import { LocalChat } from '../../types/Chat';
import { FileUploaderResult } from '../FileUploader/FileUploader';
import IconButton from '../IconButton/IconButton';
import InteractiveButton from '../InteractiveButton/InteractiveButton';
import Popup from '../Popup/Popup';
import { Alert } from 'react-bootstrap';
import ChangeableAvatar from '../ChangeableAvatar/ChangeableAvatar';

function ChatDetailsPopup() {
	const currentChat = useOutletContext<LocalChat>();
	if(!currentChat) return <></>;
	const [ user ] = useContext(UserContext);
	const [ handleClose, setHandleClose ] = useState<() => void>(null);
	const [ isEditing, setEditing ] = useState(false);
	const [ isUnsaved, setUnsaved ] = useState(false);
	const defaultValues = { name: currentChat.name};
	const [ values, handleChange ] = useForm(defaultValues);
	const [ error, setError ] = useState<string | null>(null);
	const [ isLoading, setLoading ] = useState(false);
	const formRef = useRef<HTMLFormElement>(null);
	const [ avatarUploader, setAvatarUploader ]  = useState<FileUploaderResult>({});

	/**
	 * Handle isUnsaved hook
	 */
	useEffect(() => {
		const changed = (
			values.name != defaultValues.name ||
			avatarUploader.file != undefined
		);
		setUnsaved(changed);
		if(changed && !isEditing) {
			setEditing(true);
		}
	}, [ values, avatarUploader ]);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setLoading(true);

		const formData = new FormData();
		formData.append('name', values.name);

		const avatarUpdated = avatarUploader.file != undefined;
		if(avatarUpdated) {
			formData.append('avatar', avatarUploader.file);
		}

		await getAxios(user).put('/chat/update', formData, { headers: {'Content-Type': 'multipart/form-data'}})
			.then(() => handleClose())
			.then(() => toast('Chat have been updated'))
			.catch((e) => {
				const resp: EndpointResponse<null> = e.response?.data;
				setError(resp?.message || 'Failed to update chat at this time. Please try again later.');
				setLoading(false);
			});
	}

	return (
		<Popup
			title={currentChat.name}
			footer={(
				<>
					{isEditing ? (
						<>
							<Button variant='secondary' onClick={handleClose}>
								{isUnsaved ? 'Discard changes' : 'Close'}
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
			<div className='d-flex align-items-center flex-column mb-3'>
				<ChangeableAvatar
					size={80}
					currentAvatar={currentChat.avatar}
					fileUploader={avatarUploader}
					setFileUploader={setAvatarUploader}
				/>
				<span className='lead fw-bold mt-2 d-flex align-items-center'>
					<span className='mx-1'>
						{currentChat.name}
					</span>
				</span>
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

				<FloatingLabel label={'Chat name'} className="mb-2">
					<SettingsOption
						type="text"
						name="name"
						value={values.name}
						onChange={handleChange}
						readOnly={!isEditing}
						required
						maxLength={32}
						minLength={2}
					/>
				</FloatingLabel>
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

export default ChatDetailsPopup;
