import React, { useContext } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { MessageManagerContext } from '../../context/MessageManagerContext';
import { LocalChat } from '../../types/Chat';
import ProfilePicture from '../ProfilePicture/ProfilePicture';
import './ChatList.scss';

export interface ChatListProps {
	currentChat?: LocalChat
}

function ChatList({ currentChat }: ChatListProps) {
	const [ chats ] = useContext(MessageManagerContext);
	const navigate = useNavigate();

	const noChatsInfo = (
		<span className='text-muted text-center mt-4'>
			There are no messages yet <br />
			<Link to='/chat/new' className='link-secondary'>Start a new chat</Link>
		</span>
	);

	return (
		<Row className='h-100'>
			<Col className="d-flex align-items-center py-3 px-2 flex-column">
				{chats.map((chat) => (
					<Chat
						key={chat.id}
						avatar={chat.avatar}
						name={chat.name}
						lastMessage={chat.lastMessage}
						isCurrent={chat.id == currentChat?.id}
						onClick={() => navigate(`/chat/${chat.id}`)}
					/>
				))}
				{chats.length == 0 && noChatsInfo}
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
	onClick?: React.MouseEventHandler<HTMLElement>;
}

function Chat(props: ChatProps) {
	return (
		<Row
			className={`chat flex-row rounded-3 w-100 flex-nowrap ${props.isCurrent ? 'current' : ''}`}
			style={{height: 65}}
			onClick={props.onClick}
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
