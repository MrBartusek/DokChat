import React, { useContext, useState } from 'react';
import { BsBoxArrowLeft } from 'react-icons/bs';
import { UserContext } from '../../context/UserContext';
import InteractiveButton, { InteractiveButtonProps } from '../InteractiveButton/InteractiveButton';

export interface LogoutButton extends InteractiveButtonProps {}

export default function LogoutButton(props: InteractiveButtonProps) {
	const [ user, refreshToken, setUser, callLogout ] = useContext(UserContext);
	const [ isLoading, setLoading ] = useState(false);

	async function handleClick() {
		setLoading(true);
		await callLogout();
	}

	return (
		<InteractiveButton
			loading={isLoading}
			onClick={handleClick}
			icon={BsBoxArrowLeft}
			variant="secondary"
			size='sm'
			{...props}
		>
			Logout
		</InteractiveButton>
	);
}
