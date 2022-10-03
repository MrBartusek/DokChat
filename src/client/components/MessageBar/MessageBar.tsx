import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Button, Col, Form, InputGroup, Row, Stack } from 'react-bootstrap';
import { BsImage, BsEmojiSmileFill } from 'react-icons/bs';
import { AiOutlineGif } from 'react-icons/ai';
import { MdSend } from 'react-icons/md';
import IconButton from '../IconButton/IconButton';
import io from 'socket.io-client';
import { MessageManagerContext } from '../../context/MessageManagerContext';
import { useForm } from '../../hooks/useForm';
import { Chat } from '../../types/chat';

export interface MessageBarProps {
	currentChat?: Chat
}

function MessageBar({ currentChat }: MessageBarProps) {
	const [isLoading, chats, sendMessage] = useContext(MessageManagerContext);
	const [values, handleChange, clearValues] = useForm({ content: '' });
	const [isEnabled, setEnabled] = useState(false);
	const inputRef = useRef<HTMLInputElement>();

	useEffect(() => {
		setEnabled(currentChat && values.content.length > 0 && !isLoading);
	}, [values, isLoading]);

	return (
		<Row className='d-flex py-3 px-1 align-items-center'>
			<Col className='d-flex flex-grow-0 justify-content-center align-items-center px-1 gap-1'>
				<IconButton icon={BsImage} size={34} variant='primary'/>
				<IconButton icon={AiOutlineGif} size={34} variant='primary'/>
			</Col>
			<Col className='p-0'>
				<Form className='mb-0' onSubmit={handleSend}>
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
							onFocus={(e) => e.target.parentElement?.classList.add('focus') }
							onBlur={(e) => e.target.parentElement?.classList.remove('focus') }
						/>
						<div className='d-flex align-items-center'>
							<IconButton icon={BsEmojiSmileFill} size={32} variant='primary'/>
						</div>
					</div>
				</Form>
			</Col>
			<Col className='d-flex flex-grow-0 justify-content-center align-items-center ps-1'>
				<IconButton
					icon={MdSend}
					size={34}
					variant='primary'
					onClick={handleSend}
					disabled={!isEnabled}
				/>
			</Col>
		</Row>
	);

	function handleSend(e: any) {
		e.preventDefault();
		sendMessage({
			chat: currentChat,
			content: values.content
		});
		clearValues();
		inputRef.current.focus();
	}

}
export default MessageBar;
