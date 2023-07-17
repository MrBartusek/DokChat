import React, { useContext, useEffect, useState } from 'react';
import { Stack } from 'react-bootstrap';
import { ChatParticipant, User } from '../../../types/common';
import { OnlineManagerContext } from '../../context/OnlineManagerContext';
import ProfilePicture from '../ProfilePicture/ProfilePicture';

interface UserListProps {
	users: (User | ChatParticipant)[];
}

function UserList({ users }: UserListProps) {
	return (
		<Stack>
			{users.map((user, i) => (
				<UserCard user={user} key={i} />
			))}
			{users.length == 0 && (
				<div className='text-secondary py-3 text-center'>
					Add first user to the list
				</div>
			)}
		</Stack>
	);
}

export interface UserCardProps {
	user: User | ChatParticipant;
	icons?: React.ReactNode;
}

export function UserCard({ user, icons }: UserCardProps) {
	const getOnlineStatus = useContext(OnlineManagerContext);
	const [isOnline, setOnline] = useState(false);

	useEffect(() => {
		const [online] = getOnlineStatus((user as any).userId || user.id);
		setOnline(online);
	}, [getOnlineStatus]);

	return (
		<div className='d-flex flex-row my-2 align-items-center'>
			<ProfilePicture
				src={user.avatar}
				size={36}
				isOnline={isOnline}
			/>
			<span className="ms-3 flex-fill">
				{`${user.username}#${user.tag}`}
			</span>
			{icons}
		</div>
	);
}

export default UserList;
