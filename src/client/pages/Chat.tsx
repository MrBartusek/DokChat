import React, { useContext, useState } from 'react';
import { Col, Container, Row, Stack } from 'react-bootstrap';
import ChatInfo from '../components/ChatInfo/ChatInfo';
import MessagesWindow from '../components/MessagesWindow/MessagesWindow';
import ConversationList from '../components/ConversationList/ConversationList';
import InteractiveButton from '../components/InteractiveButton/InteractiveButton';
import Layout from '../components/Layout/Layout';
import UserInfo from '../components/UserInfo/UserInfo';
import { UserContext } from '../UserContext';

export function Chat() {
	const [user] = useContext(UserContext);

	return (
		<Container fluid style={{'height': '100vh'}}>
			<Row className='h-100'>
				<Col style={{'flex': '0 0 360px', 'width': '360px'}} className='border-separator border-end'>
					<UserInfo />
					<ConversationList />
				</Col>
				<Col>
					<ChatInfo />
					<MessagesWindow />
				</Col>
			</Row>
		</Container>

	);
}
