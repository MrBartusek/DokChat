import { default as React, useContext, useEffect, useState } from 'react';
import { Alert, Stack } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { BsImage, BsPalette, BsPencil } from 'react-icons/bs';
import { ChatParticipant } from '../../../types/common';
import { EndpointResponse } from '../../../types/endpoints';
import { UserContext } from '../../context/UserContext';
import getAxios from '../../helpers/axios';
import { LocalChat } from '../../types/Chat';
import ChangeableAvatar from '../ChangeableAvatar/ChangeableAvatar';
import { FileUploaderResult } from '../FileUploader/FileUploader';
import InteractiveButton from '../InteractiveButton/InteractiveButton';
import InteractiveCard from '../InteractiveCard/InteractiveCard';
import ObjectEditHero from '../ObjectEditHero/ObjectEditHero';

export interface ChatSettingsTabProps {
	currentChat: LocalChat;
	setCustomFooter: React.Dispatch<React.SetStateAction<JSX.Element>>,
	setCustomStatic: React.Dispatch<React.SetStateAction<boolean>>,
	handleClose: () => void;
	participants?: ChatParticipant[];
}

export default function ChatSettingsTab(props: ChatSettingsTabProps) {
	const [ user ] = useContext(UserContext);
	const [ error, setError ] = useState<string | null>(null);
	const [ isLoading, setLoading ] = useState(true);
	const [ isEditing, setEditing ] = useState(false);
	const [ isUnsaved, setUnsaved ] = useState(false);

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
		setLoading(!props.participants);
	}, [ props.participants ]);

	useEffect(() => {
		props.setCustomStatic(isEditing);
	}, [ isEditing ]);

	async function handleSubmit() {
		setLoading(true);

		const formData = new FormData();
		formData.append('name', name);
		formData.append('color', color.name);

		const avatarUpdated = avatarUploader.file != undefined;
		if(avatarUpdated) {
			formData.append('avatar', avatarUploader.file);
		}

		await getAxios(user).put('/chat/update', formData, { headers: {'Content-Type': 'multipart/form-data'}})
			.then(() => props.handleClose())
			.then(() => toast('This chat has been updated'))
			.catch((e) => {
				const resp: EndpointResponse<null> = e.response?.data;
				setError(resp?.message || 'Failed to update this chat at this time. Please try again later.');
				setLoading(false);
			});
	}

	function handleDiscard() {
		setName(props.currentChat.name);
		setColor(null);
		setEditing(false);
	}

	return (
		<>
			{error && <Alert variant='danger'>{error}</Alert>}

			<ObjectEditHero
				title={props.currentChat.name}
				subTitle={`${(props.participants && props.participants.length) || 0} participants`}
				currentAvatar={props.currentChat.avatar}
				avatarUploader={avatarUploader}
				setAvatarUploader={setAvatarUploader}
			/>

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
						onClick={avatarUploader.click}
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
