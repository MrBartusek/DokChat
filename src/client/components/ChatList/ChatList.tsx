import React, { useContext } from 'react';
import { Twemoji } from 'react-emoji-render';
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
		<span className='text-muted text-center mt-4 px-1' style={{width: 320}}>
			There are no messages yet <br />
			<Link to='/chat/new' className='link-secondary'>Start a new chat</Link>
		</span>
	);

	return (
		<div className='d-flex py-3 px-2 align-items-center flex-column' style={{overflowY: 'scroll', flex: '1 0 0'}}>
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
		</div>
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
		<div
			className={`d-flex px-2 chat flex-row rounded-3 flex-nowrap ${props.isCurrent ? 'current' : ''}`}
			style={{height: 65}}
			onClick={props.onClick}
		>
			<div className="d-flex align-items-center pe-md-3">
				<ProfilePicture src={props.avatar} size={48} />
			</div>
			<div
				className='d-none d-md-flex justify-content-center flex-column py-0 px-1'
				style={{width: 240}}
			>
				<Twemoji className='text-truncate text-nowrap' text={props.name} />
				<div className='text-muted text-truncate' style={{fontSize: '0.85em'}}>
					{props.lastMessage ? (
						<Twemoji text={`${props.lastMessage.author}: ${props.lastMessage.content || '[Image]'}`} />
					): 'Click to start the chat!'}

				</div>
			</div>
		</div>
	);
}

export default ChatList;
