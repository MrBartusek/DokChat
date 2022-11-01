import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Button, Col, Form, InputGroup, OverlayTrigger, Popover, Row, Stack } from 'react-bootstrap';
import { BsImage, BsEmojiSmileFill } from 'react-icons/bs';
import { AiOutlineGif } from 'react-icons/ai';
import { MdSend } from 'react-icons/md';
import IconButton from '../IconButton/IconButton';
import io from 'socket.io-client';
import { MessageManagerContext } from '../../context/MessageManagerContext';
import { useForm } from '../../hooks/useForm';
import { LocalChat } from '../../types/Chat';
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react';
import './MessageBar.scss';

export interface MessageBarProps {
	currentChat: LocalChat
}

function MessageBar({ currentChat }: MessageBarProps) {
	const [ chats, sendMessage ] = useContext(MessageManagerContext);
	const [ values, handleChange, setValues ] = useForm({ content: '' });
	const [ isEnabled, setEnabled ] = useState(false);
	const inputRef = useRef<HTMLInputElement>();

	useEffect(() => {
		setEnabled(values.content.length > 0);
	}, [ values ]);

	const emojiPicker = (
		<Popover style={{maxWidth: 500}}>
			<Popover.Body className='p-0'>
				<EmojiPicker
					lazyLoadEmojis={true}
					emojiStyle={EmojiStyle.TWITTER}
					previewConfig={{showPreview: false}}
					onEmojiClick={(emoji) => {
						setValues({ content: values.content + emoji.emoji});
					}}
				/>
			</Popover.Body>
		</Popover>
	);

	return (
		<Col className='d-flex px-1 py-3 align-items-center'>
			<Col className='d-flex flex-grow-0 justify-content-center align-items-center px-1 gap-1'>
				<IconButton icon={BsImage} size={34} variant='primary'/>
				<IconButton icon={AiOutlineGif} size={34} variant='primary'/>
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
						onKeyDown={handleSubmit}
						type="text"
						name="content"
						placeholder="Aa"
						className='border-0 p-0 h-100 shadow-none'
						style={{'height': 34}}
						autoComplete='off'

						ref={inputRef}
						value={values.content}
						onChange={handleChange}
						onFocus={(e) => e.target.parentElement?.classList.add('focus') }
						onBlur={(e) => e.target.parentElement?.classList.remove('focus') }
					/>
					<div className='d-flex align-items-center'>
						<OverlayTrigger trigger="click" placement="top-end" overlay={emojiPicker} rootClose>
							<IconButton icon={BsEmojiSmileFill} size={32} variant='primary'/>
						</OverlayTrigger>
					</div>
				</div>
			</Col>
			<Col className='d-flex flex-grow-0 justify-content-center align-items-center ps-1'>
				<IconButton
					icon={MdSend}
					size={34}
					variant='primary'
					onClick={handleSubmit}
					disabled={!isEnabled}
				/>
			</Col>
		</Col>
	);

	function handleSubmit(e: any) {
		if(e.key && e.key != 'Enter') return;
		e.preventDefault();
		if(values.content.length < 1) return;
		sendMessage({
			chat: currentChat,
			content: values.content
		});
		setValues();
		inputRef.current.focus();
	}

}
export default MessageBar;
