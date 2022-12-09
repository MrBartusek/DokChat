import React, { useContext, useEffect, useState } from 'react';
import { Twemoji } from 'react-emoji-render';
import { BsPersonPlusFill, BsThreeDots } from 'react-icons/bs';
import { Link } from 'react-router-dom';
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
		<div className='d-flex px-3 py-2 border-bottom border-separator'>
			{currentChat && (
				<div className='d-flex pe-2'>
					<ProfilePicture src={currentChat && currentChat.avatar} isOnline={isOnline} />
				</div>
			)}
			<div className='d-flex flex-fill justify-content-center p-0 flex-column' style={{lineHeight: 1.3}}>
				<Twemoji
					className='fw-bold text-truncate'
					text={currentChat?.name || 'No chat selected'}
				/>
				{(isOnline || statusText) && (
					<span className='text-muted small'>
						{isOnline ? 'Online' : statusText}
					</span>
				)}
			</div>
			{currentChat && (
				<div className='d-flex align-items-center'>
					{!currentChat.isGroup && (
						<Link to={'/chat/new'}>
							<IconButton icon={BsPersonPlusFill} color={currentChat.color.hex} />
						</Link>
					)}
					<Link to={`/chat/${currentChat.id}/details`}>
						<IconButton icon={BsThreeDots} color={currentChat.color.hex} />
					</Link>
				</div>
			)}
		</div>
	);

}
export default ChatInfo;
