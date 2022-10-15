import React, { useEffect, useState } from 'react';
import { Row, Stack, Image } from 'react-bootstrap';
import { User } from '../../../types/common';
import { EndpointResponse, UserGetResponse } from '../../../types/endpoints';
import { useFetch } from '../../hooks/useFetch';
import ProfilePicture from '../ProfilePicture/ProfilePicture';

interface PartialUser {
	username?: string,
	tag?: string,
	id?: string
}

interface UserListProps {
    users: (User | PartialUser)[]
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
    user: User | PartialUser
}

function UserCard({ user }: UserCardProps) {
	const isProperUser = (user as User).avatar;
	const [ stateUser, setStateUser ] = useState(user);
	const url = !isProperUser && (
		user.id
			? `/user/get?id=${user.id}`
			: `/user/get?username=${user.username}&tag=${user.tag}`
	);
	const userFetch = useFetch<EndpointResponse<UserGetResponse>>(url, true);

	useEffect(() => {
		if(userFetch.loading || !userFetch.res) return;
		setStateUser(userFetch.res.data);
	}, [ userFetch ]);

	return (
		<div className='d-flex flex-row my-2 align-items-center'>
			<ProfilePicture
				src={(stateUser as User).avatar}
				size={36}
				className="me-2"
			/>
			<span>
				{stateUser.username
					? `${stateUser?.username}#${stateUser.tag}`
					: `<@${stateUser.id}>`
				}

			</span>
		</div>
	);
}

export default UserList;
