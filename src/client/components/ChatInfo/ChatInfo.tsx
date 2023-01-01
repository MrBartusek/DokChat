import React, { useContext, useEffect, useState } from 'react';
import { Twemoji } from 'react-emoji-render';
import { BsPerson, BsPersonPlusFill, BsThreeDots } from 'react-icons/bs';
import { Link, useNavigate } from 'react-router-dom';
import { OnlineManagerContext } from '../../context/OnlineManagerContext';
import { UserContext } from '../../context/UserContext';
import { LocalChat } from '../../types/Chat';
import IconButton from '../IconButton/IconButton';
import ProfilePicture from '../ProfilePicture/ProfilePicture';

export interface ChatInfoProps {
	currentChat?: LocalChat
}

function ChatInfo({ currentChat }: ChatInfoProps) {
	const [ user ] = useContext(UserContext);
	const [ [ isOnline, statusText ], setOnlineStatus ] = useState<[ boolean, string | null]>([ false, null ]);
	const getOnlineStatus = useContext(OnlineManagerContext);
	const navigate = useNavigate();

	useEffect(() => {
		if(!currentChat) return;
		if(currentChat.participants.length <= 2) {
			const part = currentChat.participants.find(p => p.userId != user.id);
			if(!part) return setOnlineStatus([ false, null ]);
			const status = getOnlineStatus(part.userId);
			setOnlineStatus(status);
		}
		else {
			const online = currentChat.participants.some(p => {
				if(p.userId == user.id) return false;
				const [ online ] = getOnlineStatus(p.userId);
				return online;
			});
			setOnlineStatus([ online, null ]);
		}

	}, [ getOnlineStatus, currentChat ]);

	return (
		<div className='d-flex px-3 py-2 border-bottom border-separator' style={{ height: 56 }}>
			{currentChat && (
				<div className='d-flex pe-3'>
					<ProfilePicture
						src={currentChat && currentChat.avatar}
						isOnline={isOnline}
						onClick={() => navigate(`/chat/${currentChat.id}/details`)}
					/>
				</div>
			)}
			<div className='d-flex flex-fill justify-content-center p-0 flex-column' style={{lineHeight: 1.3}}>
				<Twemoji
					className='fw-bold text-truncate'
					text={currentChat?.name || 'Welcome to DokChat!'}
				/>
				{(isOnline || statusText) && (
					<span className='text-muted small'>
						{isOnline ? 'Online' : statusText}
					</span>
				)}
			</div>
			{currentChat && (
				<div className='d-flex align-items-center'>
					<Link to={`/chat/${currentChat.id}/details`}>
						<IconButton icon={BsThreeDots} color={currentChat.color.hex} />
					</Link>
				</div>
			)}
		</div>
	);

}
export default ChatInfo;
