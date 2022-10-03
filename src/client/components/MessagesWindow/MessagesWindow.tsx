import React, { useContext, useEffect, useState } from 'react';
import { Col, Row, Stack, Image } from 'react-bootstrap';
import { EndpointResponse, MessageListResponse } from '../../../types/endpoints';
import { MessageManagerContext } from '../../context/MessageManagerContext';
import { useFetch } from '../../hooks/useFetch';
import { Chat } from '../../types/chat';
import LoadingWrapper from '../LoadingWrapper/LoadingWrapper';

export interface MessagesWindowProps {
	currentChat?: Chat
}

function MessagesWindow({ currentChat }: MessagesWindowProps) {
	const [isLoadingManager, chats, sendMessage, setChatList] = useContext(MessageManagerContext);

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
	return (
		<Row className='d-flex flex-grow-1'>
			<LoadingWrapper isLoading={isLoadingMessages}>
				<Stack className='gap-3 flex-column-reverse'>
					<Stack className='gap-1 flex-grow-0 flex-column-reverse'>
						{!isLoadingMessages && currentChat.messages.reverse().map((msg) => (
							<Message key={msg.id} message={msg.content} isAuthor />
						))}
					</Stack>
				</Stack>
			</LoadingWrapper>
		</Row>
	);
}

interface MessageProps {
	message: string,
	avatar?: string,
	isAuthor?: boolean
}

function Message({message, avatar, isAuthor}: MessageProps) {
	return (
		<Row className={`w-100 ${isAuthor ? 'flex-row-reverse' : 'flex-row'}`}>
			<MessageAvatar avatar={avatar} leaveSpace={!isAuthor} />
			<Col
				xs='auto'
				style={{'padding': '8px 12px', 'maxWidth': 'min(700px, 80%)', 'borderRadius': '1.2rem'}}
				className={`${isAuthor ? 'bg-primary text-light' : 'bg-gray-200'}`}
			>
				{message}
			</Col>
		</Row>
	);
}

interface MessageAvatarProps {
	avatar?: string
	leaveSpace?: boolean
}

function MessageAvatar({avatar, leaveSpace}: MessageAvatarProps) {
	if(!avatar && !leaveSpace) return (<></>);
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

export default MessagesWindow;
