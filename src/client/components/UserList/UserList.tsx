import React, { useEffect, useState } from 'react';
import { Row, Stack, Image } from 'react-bootstrap';
import { User } from '../../../types/common';
import { EndpointResponse, UserGetResponse } from '../../../types/endpoints';
import { useFetch } from '../../hooks/useFetch';
import ProfilePicture from '../ProfilePicture/ProfilePicture';

interface UserListProps {
    users: (User)[]
}

function UserList({ users}: UserListProps) {
	return (
		<Stack>
			{users.map((user, i) => (
				<UserCard user={user} key={i} />
			))}
		</Stack>
	);
}

interface UserCardProps {
    user: User
}

function UserCard({ user }: UserCardProps) {
	return (
		<div className='d-flex flex-row my-2 align-items-center'>
			<ProfilePicture
				src={user.avatar}
				size={36}
				className="me-2"
			/>
			<span>
				{`${user.username}#${user.tag}`}
			</span>
		</div>
	);
}

export default UserList;
