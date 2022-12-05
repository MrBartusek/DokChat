import EmojiPicker, { EmojiStyle } from 'emoji-picker-react';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Col, Form, OverlayTrigger, Popover } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { AiOutlineGif } from 'react-icons/ai';
import { BsEmojiSmileFill, BsImage } from 'react-icons/bs';
import { MdSend } from 'react-icons/md';
import { MessageManagerContext } from '../../context/MessageManagerContext';
import { SettingsContext } from '../../context/ThemeContext';
import { useForm } from '../../hooks/useForm';
import { LocalChat } from '../../types/Chat';
import FileUploader, { FileUploaderResult } from '../FileUploader/FileUploader';
import IconButton from '../IconButton/IconButton';
import './MessageBar.scss';

export interface MessageBarProps {
	currentChat: LocalChat
}

function MessageBar({ currentChat }: MessageBarProps) {
	const [ chats, sendMessage ] = useContext(MessageManagerContext);
	const [ values, handleChange, setValues ] = useForm({ content: '' });
	const [ isEnabled, setEnabled ] = useState(false);
	const inputRef = useRef<HTMLInputElement>();
	const [ fileUploader, setFileUploader ] = useState<FileUploaderResult>({});
	const [ settings ] = useContext(SettingsContext);

	useEffect(() => {
		setEnabled(values.content.length > 0);
	}, [ values ]);

	useEffect(() => {
		(async () => {
			if(!fileUploader.file) return;
			// First, send text message if there is any
			if(isEnabled) await handleSubmit();
			setTimeout(async() => {
				await sendMessage(currentChat, null, fileUploader.file);
				fileUploader.reset();
			}, (isEnabled ? 100 : 0));
		})();
	}, [ fileUploader ]);

	async function handleSubmit(e?: React.FormEvent<HTMLFormElement>) {
		e?.preventDefault();
		if(!isEnabled) return;
		await sendMessage(currentChat, values.content);
		setValues();
		inputRef.current.focus();
	}

	async function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
		if(!event.clipboardData.files.length) return;
		const file = event.clipboardData.files[0];
		if(!file) return;
		fileUploader.setFile(file);
	}

	async function handleDrop(event: React.DragEvent<HTMLFormElement>) {
		if(!event.dataTransfer.files.length) return;
		const file = event.dataTransfer.files[0];
		if(!file) return;
		fileUploader.setFile(file);
		event.preventDefault();
	}

	const emojiPicker = (
		<Popover style={{maxWidth: 500}}>
			<Popover.Body className='p-0'>
				<EmojiPicker
					lazyLoadEmojis={true}
					emojiStyle={EmojiStyle.TWITTER}
					previewConfig={{showPreview: false}}
					theme={settings.theme}
					onEmojiClick={(emoji) => {
						setValues({ content: values.content + emoji.emoji});
					}}
				/>
			</Popover.Body>
		</Popover>
	);

	return (
		<div className='d-flex px-1 py-3'>
			<Form
				onSubmit={handleSubmit}
				className='d-flex align-items-center w-100'
				onDrop={handleDrop}
			>
				<FileUploader onChange={setFileUploader}/>
				<Col className='d-flex flex-grow-0 justify-content-center align-items-center px-1 gap-1'>
					<IconButton icon={AiOutlineGif} size={34} variant='primary' type='button'
						onClick={() => toast.error('Not Implemented')}
					/>
					<IconButton icon={BsImage} size={34} variant='primary' type='button'
						onClick={() => fileUploader.click()}
					/>
				</Col>
				<Col className='p-0'>
					<div
						className='form-control rounded-pill d-flex flex-row gap-1 pe-1'
						style={{'height': 34}}
						tabIndex={0}
						onFocus={(e) => (e.target.firstElementChild as HTMLElement)?.focus()}
						onBlur={(e) => (e.target.firstElementChild as HTMLElement)?.blur()}
					>
						<Form.Control
							type="text"
							name="content"
							placeholder="Aa"
							className='border-0 p-0 h-100 shadow-none'
							style={{'height': 34}}
							autoComplete='off'
							ref={inputRef}
							value={values.content}
							onChange={handleChange}
							onPaste={handlePaste}
							onFocus={(e) => e.target.parentElement?.classList.add('focus') }
							onBlur={(e) => e.target.parentElement?.classList.remove('focus') }
						/>
						<div className='d-flex align-items-center'>
							<OverlayTrigger trigger="click" placement="top-end" overlay={emojiPicker} rootClose>
								<IconButton icon={BsEmojiSmileFill} size={32} variant='primary' type='button'/>
							</OverlayTrigger>
						</div>
					</div>
				</Col>
				<Col className='d-flex flex-grow-0 justify-content-center align-items-center ps-1'>
					<IconButton
						icon={MdSend}
						size={34}
						type="submit"
						variant='primary'
						disabled={!isEnabled}
					/>
				</Col>
			</Form>
		</div>
	);
}
export default MessageBar;
