import React, { useContext } from 'react';
import { Col, OverlayTrigger, Row, Tooltip, TooltipProps } from 'react-bootstrap';
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
		<Row className='p-2 border-bottom border-separator'>
			<OverlayTrigger
				placement='right'
				overlay={usernameTooltip}
			>
				<Col xs='auto'>
					<ProfilePicture src={user.avatarUrl} onClick={handleAvatarClick} />
				</Col>
			</OverlayTrigger>
			<Col className='d-flex justify-content-center align-items-center'>
				<span className='fw-bold'>
					DokChat
				</span>
			</Col>
			<Col xs='auto' className='d-flex align-items-center'>
				<IconButton icon={BsPlusCircle} onClick={handleNewChatClick} />
			</Col>
		</Row>
	);

	function handleNewChatClick() {
		navigate('/chat/new');
	}

	function handleAvatarClick() {
		navigate('/chat/profile');
	}

}
export default UserInfo;
