import React, { useContext, useEffect, useState } from 'react';
import { Twemoji } from 'react-emoji-render';
import { Link, useNavigate } from 'react-router-dom';
import { MessageManagerContext } from '../../context/MessageManagerContext';
import { OnlineManagerContext } from '../../context/OnlineManagerContext';
import { UserContext } from '../../context/UserContext';
import useBreakpoint from '../../hooks/useBreakpoint';
import { LocalChat } from '../../types/Chat';
import ProfilePicture from '../ProfilePicture/ProfilePicture';
import './ChatList.scss';
import InfiniteScroll from 'react-infinite-scroll-component';
import SimpleLoading from '../SimpleLoadng/SimpleLoading';

export interface ChatListProps {
	currentChat?: LocalChat
}

function ChatList({ currentChat }: ChatListProps) {
	const [ chats, sendMessage, setChatList, fetchMoreChats, hasMoreChats ] = useContext(MessageManagerContext);
	const [ isLoading, setLoading ] = useState(false);
	const navigate = useNavigate();
	const breakpoint = useBreakpoint();

	const noChatsInfo = (
		<span className='text-muted text-center mt-5 px-1' style={{ width: [ 'xs', 'sm' ].includes(breakpoint) ? 150 : 320 }}>
			There are no messages yet <br />
			<Link to='/chat/new' className='link-secondary'>Start a new chat</Link>
		</span>
	);

	return (
		<div
			className='d-flex py-3 px-2 align-items-center flex-column'
			style={{ overflowY: 'scroll', flex: '1 0 0' }}
			id='scrollableTarget'
		>
			<InfiniteScroll
				dataLength={chats.length}
				className='d-flex flex-column'
				next={fetchMoreChats}
				hasMore={hasMoreChats}
				loader={null}
				inverse={false}
				scrollableTarget='scrollableTarget'
			>
				{chats.map((chat) => (
					<Chat
						key={chat.id}
						chat={chat}
						isCurrent={chat.id == currentChat?.id}
						onClick={() => navigate(`/chat/${chat.id}`)}
					/>
				))}
				{chats.length == 0 && noChatsInfo}
				{isLoading ? <SimpleLoading /> : null}
			</InfiniteScroll>
		</div>
	);
}

interface ChatProps {
	chat: LocalChat,
	isCurrent?: boolean
	onClick?: React.MouseEventHandler<HTMLElement>;
}

function Chat(props: ChatProps) {
	const [ user ] = useContext(UserContext);
	const [ isOnline, setOnline ] = useState(false);
	const getOnlineStatus = useContext(OnlineManagerContext);

	useEffect(() => {
		const online = props.chat.participants.some(p => {
			if (p.userId == user.id) return false;
			const [ online ] =getOnlineStatus(p.userId);
			return online;
		});
		setOnline(online);
	}, [ getOnlineStatus ]);

	return (
		<div
			className={`d-flex px-2 chat flex-row rounded-3 flex-nowrap ${props.isCurrent ? 'current' : ''}`}
			style={{ minHeight: 65 }}
			onClick={props.onClick}
		>
			<div className="d-flex align-items-center pe-md-3">
				<ProfilePicture src={props.chat.avatar} size={48} isOnline={isOnline} />
			</div>
			<div
				className='d-none d-md-flex justify-content-center flex-column py-0 px-1'
				style={{ width: 240 }}
			>
				<Twemoji className='text-truncate text-nowrap' text={props.chat.name} />
				<div className='text-muted text-truncate' style={{ fontSize: '0.85em' }}>
					{props.chat.lastMessage ? (
						<Twemoji
							text={`
								${props.chat.lastMessage.author ? props.chat.lastMessage.author + ': ' : ''} 
								${props.chat.lastMessage.content || '[Image]'}
							`}
						/>
					) : 'Click to start the chat!'}

				</div>
			</div>
		</div>
	);
}

export default ChatList;
