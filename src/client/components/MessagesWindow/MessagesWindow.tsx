import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Col, Row, Stack, Image, Tooltip, TooltipProps, OverlayTrigger } from 'react-bootstrap';
import { BsCheckCircle, BsCheckCircleFill, BsCircle, BsXCircle } from 'react-icons/bs';
import { EndpointResponse, MessageListResponse } from '../../../types/endpoints';
import { MessageManagerContext } from '../../context/MessageManagerContext';
import { useFetch } from '../../hooks/useFetch';
import { LocalChat, LocalMessage } from '../../types/Chat';
import SimpleLoading from '../SimpleLoadng/SimpleLoading';
import * as DateFns from 'date-fns';
import { UserContext } from '../../context/UserContext';
import './MessagesWindow.scss';
import ProfilePicture from '../ProfilePicture/ProfilePicture';

export interface MessagesWindowProps {
	currentChat: LocalChat
}

function MessagesWindow({ currentChat }: MessagesWindowProps) {
	const [ chats, sendMessage, setChatList ] = useContext(MessageManagerContext);
	const [ user ] = useContext(UserContext);
	const messageWindowRef = useRef<HTMLDivElement>();
	const messagesFetch = useFetch<EndpointResponse<MessageListResponse>>(null, true);

	/**
	 * Fetch chat messages if window is targeting not initialized chat
	 */
	useEffect(() => {
		if(currentChat.isInitialized) return;
		messagesFetch.setUrl(`/chat/messages?chat=${currentChat.id}`);
	}, [ currentChat ]);

	useLayoutEffect(() => {
		if(!messageWindowRef.current) return;
		messageWindowRef.current.scrollTo(0, messageWindowRef.current.scrollHeight);
	}, [ chats, messageWindowRef ]);

	/**
	 * Load fetched data
	 */
	useEffect(() => {
		if(!messagesFetch.res) return;
		const chatId = chats.findIndex(c => c.id == currentChat.id);
		const chatsCopy = [ ...chats ];
		chatsCopy[chatId] = chatsCopy[chatId].addMessagesList(messagesFetch.res.data);
		setChatList(chatsCopy);
	}, [ messagesFetch.res ]);

	const isLoading = !currentChat.isInitialized || messagesFetch.loading;

	const messagesGroups = groupMessages(currentChat);
	const noMessagesInfo = (
		<span className='text-muted text-center mb-2'>
			Send anything to start the chat
		</span>
	);
	return (
		<Row className='d-flex flex-grow-1' ref={messageWindowRef} style={{overflowY: 'scroll'}}>
			{isLoading
				? <SimpleLoading />
				: (
					<Stack className='pt-3 gap-2 flex-column-reverse'>
						{messagesGroups.map((group, a) => (
							<Stack className='gap-1 flex-grow-0 flex-column-reverse' key={a}>
								{group.map((msg, i ) => (
									<Message
										key={msg.id}
										message={msg}
										isAuthor={user.id == msg.author.id}
										isLastStackMessage={i == 0}
									/>
								))}
							</Stack>
						))}
						{currentChat.messages.length == 0 && noMessagesInfo}
					</Stack>
				)}
		</Row>
	);
}

function groupMessages(chat: LocalChat): LocalMessage[][] {
	const messagesGroups: LocalMessage[][] = [];
	if(!chat.isInitialized) return [];
	for (let i = 0; i < chat.messages.length; i++) {
		const lastMsg = i > 0 ? chat.messages[i - 1] : null;
		const msg = chat.messages[i];

		const authorChange = lastMsg && lastMsg.author.id != msg.author.id;
		const pushToNewStack = authorChange || !lastMsg;
		const offset = +pushToNewStack - 1; // true = 1 false = 0
		if(Array.isArray(messagesGroups[messagesGroups.length + offset])) {
			messagesGroups[messagesGroups.length + offset].push(msg);
		}
		else {
			messagesGroups[messagesGroups.length + offset] = [ msg ];
		}
	}
	return messagesGroups;
}

interface MessageProps {
	message: LocalMessage,
	isAuthor?: boolean
	isLastStackMessage?: boolean
}

function Message({message, isAuthor, isLastStackMessage}: MessageProps) {
	const timeTooltip = (props: TooltipProps) => (
		<Tooltip {...props}>
			{DateFns.format(DateFns.fromUnixTime(Number(message.timestamp)), 'HH:mm')}
		</Tooltip>
	);

	return (
		<Row className={`w-100 ${isAuthor ? 'flex-row-reverse' : 'flex-row'}`}>
			{/* Show indicator only on last message of stack but keep pending indicator on every message */}
			{((isAuthor && isLastStackMessage) || (isAuthor && (message.isPending || message.isFailed)))
				? <MessageStatus isPending={message.isPending} isFailed={message.isFailed} />
				: (isAuthor && <span className='p-0' style={{width: '18px'}}></span>)}
			{/* Show avatar only on last message of stack when user is not author */}
			{(!isAuthor && isLastStackMessage)
				? <MessageAvatar avatar={message.author.avatar} />
				: (!isAuthor && <span className='p-0' style={{width: '56px'}}></span>)}
			<OverlayTrigger
				placement={isAuthor ? 'left' : 'right'}
				overlay={timeTooltip}
				delay={{show: 500, hide: 0}}
			>
				<Col
					xs='auto'
					style={{'opacity': (message.isPending || message.isFailed) ? '50%' : '100%'}}
					className={`message text-break ${isAuthor ? 'bg-primary text-light' : 'bg-gray-200'}`}
				>
					{message.content}
				</Col>
			</OverlayTrigger>
		</Row>

	);
}

interface MessageAvatarProps {
	avatar?: string
}

function MessageAvatar({avatar}: MessageAvatarProps) {
	return (
		<Col xs='auto' className='d-flex align-items-end'>
			{avatar ? (
				<ProfilePicture src={avatar} size={32} />
			) : (
				<div style={{height: 32, width: 32}}></div>
			)}
		</Col>
	);
}

interface MessageStatusProps {
	isPending?: boolean
	isFailed?: boolean
}

function MessageStatus({isPending, isFailed: isError}: MessageStatusProps) {
	let icon = BsCheckCircleFill;
	if (isPending) icon = BsCheckCircle;
	if (isError) icon = BsXCircle;
	const iconEl = React.createElement(
		icon, {
			size: 14,
			color: `var(--bs-${isError ? 'danger' : 'primary'})`
		}
	);
	return (
		<Col xs='auto' className='d-flex align-items-end pe-0 ps-1'>
			{iconEl}
		</Col>
	);
}

export default MessagesWindow;
