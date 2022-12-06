import * as DateFns from 'date-fns';
import React, { useContext, useEffect, useLayoutEffect, useRef } from 'react';
import { OverlayTrigger, Tooltip, TooltipProps } from 'react-bootstrap';
import { Twemoji } from 'react-emoji-render';
import { BsCheckCircle, BsCheckCircleFill, BsXCircle } from 'react-icons/bs';
import { EndpointResponse, MessageListResponse } from '../../../types/endpoints';
import { MessageManagerContext } from '../../context/MessageManagerContext';
import { UserContext } from '../../context/UserContext';
import { useFetch } from '../../hooks/useFetch';
import { LocalChat, LocalMessage } from '../../types/Chat';
import MessageAttachment from '../MessageAttachment/MessageAttachment';
import ProfilePicture from '../ProfilePicture/ProfilePicture';
import Separator from '../Separator/Separator';
import SimpleLoading from '../SimpleLoadng/SimpleLoading';
import './MessagesWindow.scss';

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
		console.log('set fetch');
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

	function timestampDiffInHours(a: string, b: string) {
		return Math.abs(DateFns.differenceInHours(
			DateFns.fromUnixTime(Number(a)),
			DateFns.fromUnixTime(Number(b))));
	}

	const isLoading = !currentChat.isInitialized || messagesFetch.loading;

	const noMessagesInfo = (
		<span className='text-muted text-center mb-2'>
			Send anything to start the chat
		</span>
	);
	return (
		<div className='d-flex px-3 flex-column-reverse' ref={messageWindowRef} style={{overflowY: 'scroll', flex: '1 0 0'}}>
			{isLoading ? <SimpleLoading /> : (
				<>
					{currentChat.messages.length == 0 && noMessagesInfo }
					{currentChat.messages.map((msg, index, elements) => {
						const BLOCK_SEPARATION_HOURS = 1;

						const prev: LocalMessage | undefined = elements[index - 1];
						const next: LocalMessage | undefined = elements[index + 1];
						const isAuthor = msg.author.id == user.id;
						const timestampDiffNext = next ? timestampDiffInHours(msg.timestamp, next.timestamp) : 0;
						const timestampDiffPrev = prev ? timestampDiffInHours(msg.timestamp, prev.timestamp) : 0;
						const showTimestamp = timestampDiffNext >= BLOCK_SEPARATION_HOURS || !next;

						const msgTimestamp = DateFns.fromUnixTime(Number(msg.timestamp));
						const sendAgoInHours = Math.abs(DateFns.differenceInHours(msgTimestamp, new Date()));

						let format = 'HH:mm';
						if(sendAgoInHours > 24 * 7) {
							format = 'd LLLL yyyy, HH:mm';
						}
						else if(!DateFns.isToday(msgTimestamp)) {
							format = 'EEE, HH:mm';
						}

						const isFirstInBlock = timestampDiffPrev >= BLOCK_SEPARATION_HOURS;

						return (
							<div className='d-flex flex-column' key={msg.id}>
								{(showTimestamp) && (
									<SystemMessage
										content={DateFns.format(DateFns.fromUnixTime(Number(msg.timestamp)), format)}
									/>
								)}
								<UserMessage
									currentChat={currentChat}
									message={msg}
									showAvatar={!isAuthor && (msg.author.id != prev?.author?.id || isFirstInBlock)}
									showAuthor={!isAuthor && (msg.author.id != next?.author?.id || showTimestamp)}
									showStatus={isAuthor && msg.author.id != prev?.author?.id}
								/>
								{(prev && msg.author.id != prev.author.id) && <Separator height={12} />}
							</div>
						);
					})}
				</>
			)}
		</div>
	);
}

interface MessageProps {
	currentChat: LocalChat,
	message: LocalMessage,
	showAvatar?: boolean
	showAuthor?: boolean
	showStatus?: boolean
}

function UserMessage({currentChat, message, showAvatar, showAuthor, showStatus}: MessageProps) {
	const [ user ] = useContext(UserContext);
	const isAuthor = message.author.id == user.id;

	// If message is pending or failed, display status regardless of props
	if(message.isPending || message.isFailed) {
		showStatus = true;
	}
	const isSent = !(message.isPending || message.isFailed);

	const timeTooltip = (props: TooltipProps) => (
		<Tooltip {...props}>
			{DateFns.format(DateFns.fromUnixTime(Number(message.timestamp)), 'HH:mm')}
		</Tooltip>
	);

	const onlyEmojisRegex = /^(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])+$/i;
	const nonTextMessage = (message.attachment && isSent) || onlyEmojisRegex.test(message.content);

	return (
		<div className='d-flex flex-row align-items-end' style={{marginBottom: 3}}>
			<div className='me-2'>
				{showAvatar
					? <ProfilePicture src={message.author.avatar} size={32}/>
					: <Separator width={32} />}
			</div>

			<div className='d-flex flex-fill flex-column'>
				{showAuthor && (
					<span className='text-muted' style={{marginLeft: 12, fontSize: '0.7em'}}>
						{message.author.username}
					</span>)
				}
				<div className={`d-flex ${isAuthor ? 'flex-row-reverse' : 'flex-row'}`}>
					<OverlayTrigger placement={isAuthor ? 'left' : 'right'} overlay={timeTooltip} delay={{show: 500, hide: 0}}>
						<div
							style={{
								opacity: isSent ? '100%' : '50%',
								backgroundColor: (isAuthor ? currentChat.color.hex : '')
							}}
							className={`message text-break ${message.attachment ? 'attachment' : ''} ${nonTextMessage ? 'message-emojis' : (isAuthor ? 'text-light' : '')}`}
						>
							{message.attachment ? (
								<MessageAttachment message={message} />
							): (
								<Twemoji text={message.content || ''} onlyEmojiClassName={nonTextMessage ? 'large-emojis' : ''} />
							)}
						</div>
					</OverlayTrigger>
				</div>
			</div>

			{showStatus
				? <MessageStatus color={currentChat.color.hex} isPending={message.isPending} isFailed={message.isFailed} />
				: <Separator width={18} />}
		</div>
	);
}

interface SystemMessageProps {
	content: string,
}

function SystemMessage({ content }: SystemMessageProps) {
	return (
		<div className='d-flex m-3 justify-content-center text-muted fw-bold' style={{fontSize: '0.8em'}}>
			{content}
		</div>
	);
}

interface MessageStatusProps {
	isPending?: boolean
	isFailed?: boolean
	color: string
}

function MessageStatus({color, isPending, isFailed: isError}: MessageStatusProps) {
	let icon = BsCheckCircleFill;
	if (isPending) icon = BsCheckCircle;
	if (isError) icon = BsXCircle;
	const iconEl = React.createElement(
		icon, {
			size: 14,
			color: isError ? 'var(--bs-danger)' : color
		}
	);
	return (
		<div className='d-flex align-items-end pe-0 ps-1'>
			{iconEl}
		</div>
	);
}

export default MessagesWindow;
