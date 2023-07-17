import { default as React, FormEvent, useContext, useEffect, useRef, useState } from 'react';
import { Alert, FloatingLabel, Form, FormControlProps } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { BsPencil } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import { EndpointResponse } from '../../../types/endpoints';
import { UserContext } from '../../context/UserContext';
import getAxios from '../../helpers/axios';
import { useForm } from '../../hooks/useForm';
import ChangeableAvatar from '../ChangeableAvatar/ChangeableAvatar';
import CopyButton from '../CopyButton/CopyButton';
import { FileUploaderResult } from '../FileUploader/FileUploader';
import IconButton from '../IconButton/IconButton';
import InteractiveButton from '../InteractiveButton/InteractiveButton';
import ObjectHero from '../ObjectHero/ObjectHero';

export interface ProfileSettingsProps {
	setCustomFooter: React.Dispatch<React.SetStateAction<JSX.Element>>,
	setCustomStatic: React.Dispatch<React.SetStateAction<boolean>>,
	handleClose: () => void;
}

export default function ProfileSettings(props: ProfileSettingsProps) {
	const [ user, updateToken ] = useContext(UserContext);
	const defaultValues = { username: user.username, tag: user.tag, email: user.email, password: '' };
	const [ values, handleChange, resetForm ] = useForm(defaultValues);
	const [ error, setError ] = useState<string | null>(null);
	const [ avatarUploader, setAvatarUploader ] = useState<FileUploaderResult>({});
	const [ isEditing, setEditing ] = useState(false);
	const [ isUnsaved, setUnsaved ] = useState(false);
	const [ isLoading, setLoading ] = useState(false);
	const formRef = useRef<HTMLFormElement>(null);

	/**
	 * Handle isUnsaved hook
	 */
	useEffect(() => {
		const changed = (
			values.username != defaultValues.username ||
			values.tag != defaultValues.tag ||
			values.email != defaultValues.email ||
			avatarUploader.file != undefined
		);
		setUnsaved(changed);
		if (changed && !isEditing) {
			setEditing(true);
		}
	}, [ values, avatarUploader ]);

	/**
	 * Handle footer
	 */
	useEffect(() => {
		if (!isEditing) return props.setCustomFooter(null);
		props.setCustomFooter(
			<>
				<InteractiveButton variant='secondary' onClick={handleDiscard}>
					{isUnsaved ? 'Discard changes' : 'Cancel'}
				</InteractiveButton>
				<InteractiveButton
					variant='primary'
					onClick={() => formRef.current.requestSubmit()}
					disabled={!isUnsaved}
					loading={isLoading}
				>
					Save Changes
				</InteractiveButton>
			</>
		);
	}, [ isEditing, isUnsaved, isLoading ]);

	useEffect(() => {
		props.setCustomStatic(isEditing);
	}, [ isEditing ]);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setLoading(true);

		const formData = new FormData();
		formData.append('username', values.username);
		formData.append('tag', values.tag);
		formData.append('email', values.email);
		formData.append('password', values.password);

		const avatarUpdated = avatarUploader.file != undefined;
		if (avatarUpdated) {
			formData.append('avatar', avatarUploader.file);
		}

		await getAxios(user).put('/user/update-profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
			.then(() => updateToken(avatarUpdated))
			.then(() => props.handleClose())
			.then(() => toast('Your profile has been updated'))
			.catch((e) => {
				const resp: EndpointResponse<null> = e.response?.data;
				setError(resp?.message || 'Failed to update profile at this time. Please try again later.');
				setLoading(false);
			});
	}

	function handleDiscard() {
		resetForm();
		avatarUploader.reset();
		setEditing(false);
		setUnsaved(false);
	}

	return (
		<>
			{error && <Alert variant='danger'>{error}</Alert>}

			<ObjectHero
				title={(<>
					{user.username}
					<span className="text-muted">#{user.tag}</span>
				</>)}
				subTitle="Online"
				currentAvatar={user.avatar}
				avatarUploader={avatarUploader}
				setAvatarUploader={setAvatarUploader}
				copyText={user.discriminator}
			/>

			<Form ref={formRef} onSubmit={handleSubmit}>
				<div className="position-relative">
					{!isEditing && (
						<IconButton
							icon={BsPencil}
							className="position-absolute top-p end-0 mt-2"
							style={{ zIndex: 1 }}
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
						disabled={isLoading}
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
						disabled={isLoading}
						required
						maxLength={4}
						minLength={4}
						pattern="\d{4}"

					/>
				</FloatingLabel>
				<FloatingLabel
					className="mb-2"
					label={(
						<>
							<span>E-mail address</span>
							{!user.isEmailConfirmed && !isEditing && (
								<>
									<span> - </span>
									<Link to='/chat/email-confirm' style={{ pointerEvents: 'auto' }}>
										Confirm E-Mail
									</Link>
								</>
							)}
						</>
					)}
				>
					<SettingsOption
						type="email"
						name="email"
						value={isEditing ? values.email : user.emailMasked}
						onChange={handleChange}
						readOnly={!isEditing}
						disabled={isLoading}
						required
					/>
				</FloatingLabel>
				{isEditing && (
					<FloatingLabel label={'Confirm your password'}>
						<SettingsOption
							type="password"
							name="password"
							value={values.password}
							disabled={isLoading}
							onChange={handleChange}
							required
						/>
					</FloatingLabel>
				)}
			</Form>
		</>
	);
}

function SettingsOption(props: FormControlProps & React.AllHTMLAttributes<HTMLInputElement>) {
	const propsCopy = Object.assign({}, props);
	if (propsCopy.readOnly) {
		propsCopy.className = ' form-control-plaintext';
		propsCopy.onFocus = (e) => e.target.blur();
	}
	return (
		<Form.Control {...propsCopy} />
	);
}
