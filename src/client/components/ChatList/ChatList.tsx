import React, { useContext, useState } from 'react';
import { Col, Row, Stack, Image } from 'react-bootstrap';
import { ChatListResponse, EndpointResponse } from '../../../types/endpoints';
import { MessageManagerContext } from '../../context/MessageManagerContext';
import { UserContext } from '../../context/UserContext';
import { useFetch } from '../../hooks/useFetch';
import { LocalChat } from '../../types/Chat';
import ProfilePicture from '../ProfilePicture/ProfilePicture';
import SimpleLoading from '../SimpleLoadng/SimpleLoading';
import './ChatList.scss';

export interface ChatListProps {
	currentChat: LocalChat
}

function ChatList({ currentChat }: ChatListProps) {
	const [ chats, sendMessage ] = useContext(MessageManagerContext);
	const [ user ] = useContext(UserContext);

	return (
		<Row className='h-100'>
			<Col className="d-flex justify-content-center py-1 px-2">
				{chats.map((chat) => (
					<Chat
						key={chat.id}
						avatar={chat.avatar}
						name={chat.name}
						lastMessage={chat.lastMessage}
						isCurrent={chat.id == currentChat.id}
					/>
				))}
			</Col>
		</Row>
	);
}

interface ChatProps {
    avatar: string,
	name: string,
	lastMessage: {
		content: string,
		author: string
	},
	isCurrent?: boolean
}

function Chat(props: ChatProps) {
	return (
		<Row
			className={`chat flex-row rounded-3 w-100 flex-nowrap ${props.isCurrent ? 'current' : ''}`}
			style={{height: 65}}
		>
			<Col xs='auto' className="d-flex align-items-center">
				<ProfilePicture src={props.avatar} size={48} />
			</Col>
			<Col
				xs='auto'
				className='d-flex justify-content-center flex-column py-0 px-1'
				style={{maxWidth: '250px'}}
			>
				<div className='fw-bol text-truncate'>
					{props.name}
				</div>
				<div className='text-muted text-truncate' style={{fontSize: '0.85em'}}>
					{props.lastMessage ? (
						<span>{props.lastMessage.author}: {props.lastMessage.content}</span>
					): 'Click to start the chat!'}

				</div>
			</Col>
		</Row>
	);
}

export default ChatList;
