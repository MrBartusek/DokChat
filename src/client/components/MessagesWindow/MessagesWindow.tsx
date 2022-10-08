import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Col, Row, Stack, Image, Tooltip, TooltipProps, OverlayTrigger } from 'react-bootstrap';
import { BsCheckCircle, BsCheckCircleFill, BsCircle } from 'react-icons/bs';
import { EndpointResponse, MessageListResponse } from '../../../types/endpoints';
import { MessageManagerContext } from '../../context/MessageManagerContext';
import { useFetch } from '../../hooks/useFetch';
import { LocalChat, LocalMessage } from '../../types/Chat';
import LoadingWrapper from '../LoadingWrapper/LoadingWrapper';
import * as DateFns from 'date-fns';
import { UserContext } from '../../context/UserContext';
import './MessagesWindow.scss';

export interface MessagesWindowProps {
	currentChat?: LocalChat
}

function MessagesWindow({ currentChat }: MessagesWindowProps) {
	const [isLoadingManager, chats, sendMessage, setChatList] = useContext(MessageManagerContext);
	const [ user ] = useContext(UserContext);
	const messageWindowRef = useRef<HTMLDivElement>();

	const [fetchUrl, setFetchUrl] = useState<string | null>(null);
	const messagesFetch = useFetch<EndpointResponse<MessageListResponse>>(fetchUrl, true);

	/**
	 * Fetch chat messages if window is targeting not initialized chat
	 */
	useEffect(() => {
		if(!currentChat) return;
		if(currentChat.isInitialized) return;
		setFetchUrl(`/chat/messages?chat=${currentChat.id}`);
	}, [currentChat]);

	useLayoutEffect(() => {
		messageWindowRef.current.scrollTo(0, messageWindowRef.current.clientHeight + 100);
	}, [chats]);

	/**
	 * Load fetched data
	 */
	useEffect(() => {
		if(!messagesFetch.res) return;
		const chatId = chats.findIndex(c => c.id == currentChat.id);
		const chatsCopy = [...chats];
		chatsCopy[chatId] = chatsCopy[chatId].addMessagesList(messagesFetch.res.data);
		setChatList(chatsCopy);
	}, [messagesFetch]);

	const isLoadingMessages = (!currentChat || isLoadingManager || !currentChat.isInitialized || messagesFetch.loading);
	const messagesGroups: LocalMessage[][] = [];
	if(!isLoadingMessages) {
		for (let i = 0; i < currentChat.messages.length; i++) {
			const lastMsg = i > 0 ? currentChat.messages[i - 1] : null;
			const msg = currentChat.messages[i];

			const authorChange = lastMsg && lastMsg.author.id != msg.author.id;
			const pushToNewStack = authorChange || !lastMsg;
			const offset = +pushToNewStack - 1; // true = 1 false = 0
			if(Array.isArray(messagesGroups[messagesGroups.length + offset])) {
				messagesGroups[messagesGroups.length + offset].push(msg);
			}
			else {
				messagesGroups[messagesGroups.length + offset] = [msg];
			}
		}
	}
	return (
		<Row className='d-flex flex-grow-1' ref={messageWindowRef} style={{overflowY: 'scroll'}}>
			<LoadingWrapper isLoading={isLoadingMessages}>
				<Stack className='pt-3 gap-2 flex-column-reverse'>
					{messagesGroups.map((group, a) => (
						<Stack className='gap-1 flex-grow-0 flex-column-reverse' key={a}>
							{group.map((msg, i, arr) => (
								<Message
									key={msg.id}
									message={msg}
									isAuthor={user.id == msg.author.id}
									isLastStackMessage={i == 0}/>
							))}
						</Stack>
					))}
					{!isLoadingMessages && currentChat.messages.length == 0 &&
							<span className='text-muted text-center mb-2'>
								Send anything to start the conversation
							</span>
					}
				</Stack>
			</LoadingWrapper>
		</Row>
	);
}

interface MessageProps {
	message: LocalMessage,
	isAuthor?: boolean
	isLastStackMessage?: boolean
}

function Message({message, isAuthor, isLastStackMessage}: MessageProps) {
	const timeTooltip = (props: TooltipProps) => (
		<Tooltip id="button-tooltip"  {...props}>
			{DateFns.format(DateFns.fromUnixTime(Number(message.timestamp)), 'HH:mm')}
		</Tooltip>
	);

	return (
		<Row className={`w-100 ${isAuthor ? 'flex-row-reverse' : 'flex-row'}`}>
			{/* Show indicator only on last message of stack but keep pending indicator on every message */}
			{((isAuthor && isLastStackMessage) || (isAuthor && message.isPending))
				? <MessageStatus isPending={message.isPending} />
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
					style={{'opacity': message.isPending ? '50%' : '100%'}}
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
				<Image roundedCircle src={avatar} style={{height: 32, width: 32}} />
			) : (
				<div style={{height: 32, width: 32}}></div>
			)}
		</Col>
	);
}

interface MessageStatusProps {
	isPending?: boolean
}

function MessageStatus({isPending}: MessageStatusProps) {
	const iconEl = React.createElement(
		isPending ? BsCheckCircle : BsCheckCircleFill, {
			size: 14,
			color: 'var(--bs-primary'
		}
	);
	return (
		<Col xs='auto' className='d-flex align-items-end pe-0 ps-1'>
			{iconEl}
		</Col>
	);
}

export default MessagesWindow;
