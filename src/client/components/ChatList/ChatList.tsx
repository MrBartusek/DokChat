import React, { useContext, useState } from 'react';
import { Col, Row, Stack, Image } from 'react-bootstrap';
import { ChatListResponse, EndpointResponse } from '../../../types/endpoints';
import { MessageManagerContext } from '../../context/MessageManagerContext';
import { UserContext } from '../../context/UserContext';
import { useFetch } from '../../hooks/useFetch';
import { LocalChat } from '../../types/Chat';
import LoadingWrapper from '../LoadingWrapper/LoadingWrapper';
import './ChatList.scss';

export interface ChatListProps {
	currentChat?: LocalChat
}

function ChatList({ currentChat }: ChatListProps) {
	const [isLoading, chats, sendMessage] = useContext(MessageManagerContext);
	const [user] = useContext(UserContext);

	return (
		<Row className='h-100'>
			<LoadingWrapper isLoading={isLoading}>
				<Col className="d-flex justify-content-center py-1 px-2">
					{chats.map((chat) => (
						<Conversation
							key={chat.id}
							avatar={chat.avatar}
							name={chat.name}
							lastMessage={chat.lastMessage}
							isCurrent={currentChat && chat.id == currentChat.id}
						/>
					))}
				</Col>
			</LoadingWrapper>
		</Row>
	);
}

interface ConversationProps {
    avatar: string,
	name: string,
	lastMessage: {
		content: string,
		author: string
	},
	isCurrent?: boolean
}

function Conversation(props: ConversationProps) {
	return (
		<Row
			className={`conversation flex-row rounded-3 w-100 flex-nowrap ${props.isCurrent ? 'current' : ''}`}
			style={{height: 65}}
		>
			<Col xs='auto' className="d-flex align-items-center">
				<Image roundedCircle src={props.avatar} style={{height: '48px'}} />
			</Col>
			<Col
				xs='auto'
				className='d-flex justify-content-center flex-column py-0 px-1'
				style={{maxWidth: '250px'}}
			>
				<div className='fw-bold'>
					{props.name}
				</div>
				<div className='text-muted text-truncate' style={{fontSize: '0.85em'}}>
					{props.lastMessage ? (
						<span>{props.lastMessage.author}: {props.lastMessage.content}</span>
					): 'Click to start the conversation!'}

				</div>
			</Col>
		</Row>
	);
}

export default ChatList;
