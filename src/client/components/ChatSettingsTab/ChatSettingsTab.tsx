import { default as React, useContext, useEffect, useState } from 'react';
import { Alert, FloatingLabel, Form, Stack } from 'react-bootstrap';
import { CirclePicker } from 'react-color';
import { Twemoji } from 'react-emoji-render';
import toast from 'react-hot-toast';
import { BsImage, BsPalette, BsPencil } from 'react-icons/bs';
import { CHAT_COLORS } from '../../../types/colors';
import { ChatParticipant } from '../../../types/common';
import { EndpointResponse } from '../../../types/endpoints';
import { UserContext } from '../../context/UserContext';
import getAxios from '../../helpers/axios';
import { LocalChat } from '../../types/Chat';
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

	const [ tab, setTab ] = useState('home');

	/**
	 * Handle isUnsaved hook
	 */
	useEffect(() => {
		const changed = (
			name != props.currentChat.name ||
			color.name != props.currentChat.color.name ||
			avatarUploader.file != undefined
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
					{tab != 'home' ? 'Back' : (isUnsaved ? 'Discard changes' : 'Cancel')}
				</InteractiveButton>
				<InteractiveButton
					variant='primary'
					onClick={handleSubmit}
					disabled={!isUnsaved}
					loading={isLoading}
				>
					Save Changes
				</InteractiveButton>
			</>
		);
	}, [ isEditing, isUnsaved, tab, name, color ]);

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
		formData.append('color', color.hex);
		formData.append('id', props.currentChat.id);

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
		if(tab !== 'home') return setTab('home');
		setName(props.currentChat.name);
		setColor(props.currentChat.color);
		setEditing(false);
	}

	function handleTabChange(tab: string) {
		setEditing(true);
		setTab(tab);
	}

	const participantsCount = (props.participants && props.participants.length) || 0;

	return (
		<>
			<ObjectEditHero
				title={<Twemoji text={name || props.currentChat.name} />}
				subTitle={!props.currentChat.isGroup ? 'Private Conversation' : `${participantsCount} participants`}
				currentAvatar={props.currentChat.avatar}
				avatarUploader={avatarUploader}
				setAvatarUploader={setAvatarUploader}
			/>

			{error && <Alert variant='danger'>{error}</Alert>}

			{tab == 'home' && (
				<Stack gap={3}>
					{props.currentChat.isGroup && (
						<InteractiveCard
							title="Change chat name"
							description={name}
							icon={BsPencil}
							disabled={isLoading}
							showArrow
							onClick={() => handleTabChange('name')}
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
						onClick={() => handleTabChange('color')}
					/>
				</Stack>
			)}

			{tab == 'name' && (
				<Form autoComplete='off' className='py-3' onSubmit={(e) => {
					e.preventDefault();
					setTab('home');
				}}>
					<FloatingLabel label={'Chat name'}>
						<Form.Control
							autoFocus
							type="text"
							name="Chat name"
							className='pb-3'
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
							maxLength={32}
							minLength={2}
						/>
					</FloatingLabel>
				</Form>
			)}

			{tab == 'color' && (
				<div className='py-3 d-flex align-items-center flex-column'>
					<div className='text-muted pb-3'>
						Select chat color
					</div>
					<CirclePicker
						colors={CHAT_COLORS.map(c => c.hex)}
						color={color.hex}
						circleSize={30}
						circleSpacing={18}
						width='240px'
						className='pb-3'
						onChangeComplete={(c) => setColor(CHAT_COLORS.find(x => c.hex == x.hex))}
					/>
				</div>
			)}
		</>
	);
}
