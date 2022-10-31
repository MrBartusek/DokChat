import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Tooltip, TooltipProps, OverlayTrigger } from 'react-bootstrap';
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
import { Twemoji } from 'react-emoji-render';

export interface MessagesWindowProps {
	currentChat: LocalChat
}

function MessagesWindow({ currentChat }: MessagesWindowProps) {
	const [ chats, sendMessage, setChatList ] = useContext(MessageManagerContext);
	const [ user ] = useContext(UserContext);
	const messageWindowRef = useRef<HTMLDivElement>();
	const messagesFetch = useFetch<EndpointResponse<MessageListResponse>>(null, true);

	useLayoutEffect(() => {
		if(!messageWindowRef.current) return;
		messageWindowRef.current.scrollTo(0, messageWindowRef.current.scrollHeight);
	}, [ chats, messageWindowRef ]);

	/**
	 * Fetch chat messages if window is targeting not initialized chat
	 */
	useEffect(() => {
		if(currentChat.isInitialized) return;
		messagesFetch.setUrl(`/chat/messages?chat=${currentChat.id}`);
	}, [ currentChat ]);
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

	const noMessagesInfo = (
		<span className='text-muted text-center mb-2'>
			Send anything to start the chat
		</span>
	);
	return (
		<div className='d-flex w-100 h-100 flex-column-reverse' ref={messageWindowRef} style={{overflowY: 'scroll'}}>
			{isLoading ? <SimpleLoading /> : (
				<>
					{currentChat.messages.length == 0 && noMessagesInfo }
					{currentChat.messages.map((msg, index, elements) => {
						const prev: LocalMessage | undefined = elements[index - 1];
						const next: LocalMessage | undefined = elements[index + 1];
						const isAuthor = msg.author.id == user.id;

						return (
							<>
								<UserMessage
									key={msg.id}
									message={msg}
									showAvatar={!isAuthor && msg.author.id != prev?.author?.id}
									showAuthor={!isAuthor && msg.author.id != next?.author?.id}
									showStatus={isAuthor && msg.author.id != prev?.author?.id}
								/>
								{(msg.author.id != next?.author?.id) && <Separator height={12} />}
							</>
						);
					})}
				</>
			)}
		</div>
	);
}

interface MessageProps {
	message: LocalMessage,
	showAvatar?: boolean
	showAuthor?: boolean
	showStatus?: boolean
}

function UserMessage({message, showAvatar, showAuthor, showStatus}: MessageProps) {
	const [ user ] = useContext(UserContext);
	const isAuthor = message.author.id == user.id;

	// If message is pending or faled, display status regardless of props
	if(message.isPending || message.isFailed) {
		showStatus = true;
	}

	const timeTooltip = (props: TooltipProps) => (
		<Tooltip {...props}>
			{DateFns.format(DateFns.fromUnixTime(Number(message.timestamp)), 'HH:mm')}
		</Tooltip>
	);

	const onlyEmojisRegex = /^(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])+$/i;
	const onlyEmojis = onlyEmojisRegex.test(message.content);

	return (
		<div className='d-flex flex-row align-items-end' style={{marginBottom: 3}}>
			<div className='me-2'>
				{showAvatar
					? <ProfilePicture src={message.author.avatar} size={32}/>
					: <Separator width={32} />}
			</div>

			<div className='d-flex flex-grow-1 flex-column'>
				{showAuthor && (
					<span className='text-muted' style={{marginLeft: 12, fontSize: '0.7em'}}>
						{message.author.username}
					</span>)
				}
				<div className={`d-flex ${isAuthor ? 'flex-row-reverse' : 'flex-row'}`}>
					<OverlayTrigger
						placement={isAuthor ? 'left' : 'right'}
						overlay={timeTooltip}
						delay={{show: 500, hide: 0}}
					>
						<div
							style={{'opacity': (message.isPending || message.isFailed) ? '50%' : '100%'}}
							className={`message text-break ${onlyEmojis ? 'message-emojis' : (isAuthor ? 'bg-primary text-light' : 'bg-gray-200')}`}
						>
							<Twemoji text={message.content} onlyEmojiClassName={onlyEmojis ? 'large-emojis' : ''} />
						</div>
					</OverlayTrigger>
				</div>
			</div>

			{showStatus
				? <MessageStatus isPending={message.isPending} isFailed={message.isFailed} />
				: <Separator width={18} />}
		</div>
	);
}

interface SeparatorProps {
	width?: string | number
	height?: string | number
}

function Separator({ width, height }: SeparatorProps) {
	return (
		<div role='none' className='p-0' style={{minWidth: width || '100%', minHeight: height || '100%'}}></div>
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
		<div className='d-flex align-items-end pe-0 ps-1'>
			{iconEl}
		</div>
	);
}

export default MessagesWindow;
