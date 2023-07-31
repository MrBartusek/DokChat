import React from 'react';
import { BsTrash } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import InteractiveButton, { InteractiveButtonProps } from '../InteractiveButton/InteractiveButton';

export interface LogoutButton extends InteractiveButtonProps { }

export default function DeleteAccountButton(props: InteractiveButtonProps) {
	return (
		<Link to={!props.disabled ? '/chat/delete-account' : ''}>
			<InteractiveButton
				icon={BsTrash}
				variant="danger"
				{...props}
			>
				Delete Account
			</InteractiveButton>
		</Link>
	);
}
