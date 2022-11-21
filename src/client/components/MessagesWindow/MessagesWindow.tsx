import * as DateFns from 'date-fns';
import React, { useContext, useEffect, useLayoutEffect, useRef } from 'react';
import { OverlayTrigger, Spinner, Tooltip, TooltipProps } from 'react-bootstrap';
import { Twemoji } from 'react-emoji-render';
import { BsCheckCircle, BsCheckCircleFill, BsXCircle } from 'react-icons/bs';
import { EndpointResponse, MessageListResponse } from '../../../types/endpoints';
import { MessageManagerContext } from '../../context/MessageManagerContext';
import { UserContext } from '../../context/UserContext';
import { useFetch } from '../../hooks/useFetch';
import { LocalChat, LocalMessage } from '../../types/Chat';
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
		<div className='d-flex px-2 flex-column-reverse' ref={messageWindowRef} style={{overflowY: 'scroll', flex: '1 0 0'}}>
			{isLoading ? <SimpleLoading /> : (
				<>
					{currentChat.messages.length == 0 && noMessagesInfo }
					{currentChat.messages.map((msg, index, elements) => {
						const prev: LocalMessage | undefined = elements[index - 1];
						const next: LocalMessage | undefined = elements[index + 1];
						const isAuthor = msg.author.id == user.id;
						const timestampDiff = next ? Math.abs(DateFns.differenceInHours(
							DateFns.fromUnixTime(Number(msg.timestamp)),
							DateFns.fromUnixTime(Number(next.timestamp)))) : 0;
						const showTimestamp = timestampDiff >= 1 || !next;

						const sendAgoInHours = Math.abs(DateFns.differenceInHours(DateFns.fromUnixTime(Number(msg.timestamp)), new Date()));

						let format = 'HH:mm';
						if(sendAgoInHours > 24 * 7) {
							format = 'd LLLL yyyy, HH:mm';
						}
						else if(sendAgoInHours > 24) {
							format = 'EEE, HH:mm';
						}

						return (
							<div className='d-flex flex-column' key={msg.id}>
								{(showTimestamp) && (
									<SystemMessage
										content={DateFns.format(DateFns.fromUnixTime(Number(msg.timestamp)), format)}
									/>
								)}
								<UserMessage
									message={msg}
									showAvatar={!isAuthor && msg.author.id != prev?.author?.id}
									showAuthor={!isAuthor && msg.author.id != next?.author?.id}
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
	message: LocalMessage,
	showAvatar?: boolean
	showAuthor?: boolean
	showStatus?: boolean
}

function UserMessage({message, showAvatar, showAuthor, showStatus}: MessageProps) {
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
					<OverlayTrigger
						placement={isAuthor ? 'left' : 'right'}
						overlay={timeTooltip}
						delay={{show: 500, hide: 0}}
					>
						<div
							style={{'opacity': isSent ? '100%' : '50%'}}
							className={`message text-break ${nonTextMessage ? 'message-emojis' : (isAuthor ? 'bg-primary text-light' : 'bg-gray-200')}`}
						>
							{message.attachment ? (
								<>
									{isSent ? (
										<img
											src={`/api/attachment?id=${message.id}`}
											style={{borderRadius: '1.2rem', maxHeight: '200px'}}
											alt='Message attachment'
										/>
									): (
										<>
											{message.isPending ? (
												<>
													<Spinner size='sm' variant='light' animation='border' className='me-2' />
													<span>
														Uploading Attachment
													</span>
												</>
											) : 'Attachment upload failed'}
										</>

									)}

								</>
							): (
								<Twemoji text={message.content || ''} onlyEmojiClassName={nonTextMessage ? 'large-emojis' : ''} />
							)}
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
