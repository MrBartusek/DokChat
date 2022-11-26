import React, { useContext } from 'react';
import { OverlayTrigger, Tooltip, TooltipProps } from 'react-bootstrap';
import { BsPlusCircle } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import IconButton from '../IconButton/IconButton';
import ProfilePicture from '../ProfilePicture/ProfilePicture';

function UserInfo() {
	const [ user ] = useContext(UserContext);
	const navigate = useNavigate();

	const usernameTooltip = (props: TooltipProps) => (
		<Tooltip {...props}>
			{user.discriminator}
		</Tooltip>
	);

	return (
		<div className='d-flex flex-column flex-md-row px-3 py-2 border-bottom border-separator align-items-center gap-1'>
			<div className='d-flex d-md-none'>
				<span className='fw-bold small'>
					DokChat
				</span>
			</div>
			<OverlayTrigger
				placement='right'
				overlay={usernameTooltip}
			>
				<div className='d-flex'>
					<ProfilePicture src={user.avatar} onClick={handleAvatarClick} />
				</div>
			</OverlayTrigger>
			<div className='d-none d-md-flex flex-fill justify-content-center align-items-center'>
				<span className='fw-bold'>
					DokChat
				</span>
			</div>
			<div className='d-flex align-items-center'>
				<IconButton icon={BsPlusCircle} onClick={handleNewChatClick} />
			</div>
		</div>
	);

	function handleNewChatClick() {
		navigate('/chat/new');
	}

	function handleAvatarClick() {
		navigate('/chat/profile');
	}

}
export default UserInfo;
