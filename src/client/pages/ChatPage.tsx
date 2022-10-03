import React, { useContext, useEffect, useState } from 'react';
import { Col, Container, Row, Stack } from 'react-bootstrap';
import ChatInfo from '../components/ChatInfo/ChatInfo';
import MessagesWindow from '../components/MessagesWindow/MessagesWindow';
import ChatList from '../components/ChatList/ChatList';
import UserInfo from '../components/UserInfo/UserInfo';
import MessageBar from '../components/MessageBar/MessageBar';
import { useWebsocket } from '../hooks/useWebsocket';
import { useMessageManager } from '../hooks/useMessageManager';
import { MessageManagerContext } from '../context/MessageManagerContext';
import { Chat } from '../types/chat';

export function ChatPage() {
	const ws = useWebsocket();
	const [isLoading, chats, sendMessage] = useMessageManager(ws);
	const [currentChat, setCurrentChat] = useState<Chat>(null);

	useEffect(() => {
		if(!isLoading) setCurrentChat(chats[0]);
	}, [isLoading]);

	return (
		<MessageManagerContext.Provider value={[isLoading, chats, sendMessage]}>
			<Container fluid style={{'height': '100vh', 'maxHeight': '100vh', 'overflow': 'hidden'}}>
				<Row className='h-100'>
					<Col style={{'flex': '0 0 360px', 'width': '360px'}} className='border-separator border-end'>
						<UserInfo />
						<ChatList />
					</Col>
					<Col className='d-flex align-items-stretch flex-column mh-100'>
						<ChatInfo />
						<MessagesWindow />
						<MessageBar currentChat={currentChat} />
					</Col>
				</Row>
			</Container>
		</MessageManagerContext.Provider>
	);
}
