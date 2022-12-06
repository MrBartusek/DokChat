import React from 'react';
import { Stack } from 'react-bootstrap';
import { ChatParticipant, User } from '../../../types/common';
import ProfilePicture from '../ProfilePicture/ProfilePicture';

interface UserListProps {
    users: (User | ChatParticipant)[]
}

function UserList({ users}: UserListProps) {
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

interface UserCardProps {
    user: User | ChatParticipant
}

function UserCard({ user }: UserCardProps) {
	return (
		<div className='d-flex flex-row my-2 align-items-center'>
			<ProfilePicture
				src={user.avatar}
				size={36}
				className="me-3"
			/>
			<span>
				{`${user.username}#${user.tag}`}
			</span>
		</div>
	);
}

export default UserList;
