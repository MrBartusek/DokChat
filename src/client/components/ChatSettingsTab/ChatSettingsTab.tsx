import { default as React, FormEvent, useContext, useEffect, useRef, useState } from 'react';
import { Alert, Stack } from 'react-bootstrap';
import { ColorResult } from 'react-color';
import toast from 'react-hot-toast';
import { BsImage, BsPalette, BsPencil, BsPersonPlus } from 'react-icons/bs';
import { ChatParticipant } from '../../../types/common';
import { ChatParticipantsRepose, EndpointResponse } from '../../../types/endpoints';
import { UserContext } from '../../context/UserContext';
import getAxios from '../../helpers/axios';
import { useFetch } from '../../hooks/useFetch';
import { LocalChat } from '../../types/Chat';
import ChangeableAvatar from '../ChangeableAvatar/ChangeableAvatar';
import { FileUploaderResult } from '../FileUploader/FileUploader';
import InteractiveButton from '../InteractiveButton/InteractiveButton';
import InteractiveCard from '../InteractiveCard/InteractiveCard';

export interface ChatSettingsTabProps {
	currentChat: LocalChat;
	setCustomFooter: React.Dispatch<React.SetStateAction<JSX.Element>>,
	setCustomStatic: React.Dispatch<React.SetStateAction<boolean>>,
	handleClose: () => void;
	participants?: ChatParticipant[];
}

export default function ChatSettingsTab(props: ChatSettingsTabProps) {
	const [ user, updateToken ] = useContext(UserContext);
	const [ error, setError ] = useState<string | null>(null);
	const [ isEditing, setEditing ] = useState(false);
	const [ isUnsaved, setUnsaved ] = useState(false);
	const [ isLoading, setLoading ] = useState(true);

	const [ avatarUploader, setAvatarUploader ]  = useState<FileUploaderResult>({});
	const [ name, setName ] = useState(props.currentChat.name);
	const [ color, setColor ] = useState(props.currentChat.color);

	/**
	 * Handle isUnsaved hook
	 */
	useEffect(() => {
		const changed = (
			name != props.currentChat.name ||
			color.name != props.currentChat.color.name
		);
		setUnsaved(changed);
		if(changed && !isEditing) {
			setEditing(true);
		}
	}, [ name, color, avatarUploader ]);

	useEffect(() => {
		setLoading(!props.participants);
	}, [ props.participants ]);

	/**
	 * Handle footer
	 */
	useEffect(() => {
		if(!isEditing) {
			props.setCustomFooter(null);
			return;
		}
		props.setCustomFooter(
			<>
				<InteractiveButton variant='secondary' onClick={handleDiscard}>
					{isUnsaved ? 'Discard changes' : 'Cancel'}
				</InteractiveButton>
				<InteractiveButton
					variant='primary'
					onClick={() => handleSubmit}
					disabled={!isUnsaved}
					loading={isLoading}
				>
					Save Changes
				</InteractiveButton>
			</>
		);
	}, [ isEditing, isUnsaved ]);

	useEffect(() => {
		props.setCustomStatic(isEditing);
	}, [ isEditing ]);

	async function handleSubmit() {
		setLoading(true);

		const formData = new FormData();
		formData.append('name', name);
		formData.append('color', color.hex);

		const avatarUpdated = avatarUploader.file != undefined;
		if(avatarUpdated) {
			formData.append('avatar', avatarUploader.file);
		}

		await getAxios(user).put('/user/update-profile', formData, { headers: {'Content-Type': 'multipart/form-data'}})
			.then(() => updateToken(avatarUpdated))
			.then(() => props.handleClose())
			.then(() => toast('Your profile has been updated'))
			.catch((e) => {
				const resp: EndpointResponse<null> = e.response?.data;
				setError(resp?.message || 'Failed to update profile at this time. Please try again later.');
				setLoading(false);
			});
	}

	function handleDiscard(e: React.MouseEvent) {
		setName(props.currentChat.name);
		setColor(null);
		setEditing(false);
	}

	return (
		<>
			{error && <Alert variant='danger'>{error}</Alert>}

			<div className='d-flex align-items-center flex-column mb-3'>
				<ChangeableAvatar
					size={90}
					currentAvatar={props.currentChat.avatar}
					fileUploader={avatarUploader}
					setFileUploader={setAvatarUploader}
				/>
				<span className='lead fw-bold mt-2 mx-1 d-flex align-items-center'>
					{props.currentChat.name}
				</span>
				{props.currentChat.isGroup && (
					<p className="text-muted">
						{(props.participants && props.participants.length) || 0} participants
					</p>
				)}
			</div>

			<Stack gap={3}>
				{props.currentChat.isGroup && (
					<InteractiveCard
						title="Change chat name"
						description={name}
						icon={BsPencil}
						disabled={isLoading}
						showArrow
					/>
				)}
				{props.currentChat.isGroup && (
					<InteractiveCard
						title="Change chat picture"
						description='Click here to change current avatar'
						icon={BsImage}
						disabled={isLoading}
						showArrow
					/>
				)}
				<InteractiveCard
					title="Change chat color"
					iconColor={color.hex}
					description={color.name}
					icon={BsPalette}
					disabled={isLoading}
					showArrow
				/>
			</Stack>
		</>
	);
}
