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
import { LocalChat } from '../types/Chat';
import { Outlet, useLocation, useNavigate, useOutlet, useParams, useResolvedPath } from 'react-router-dom';
import MainLoading from '../components/MainLoading/MainLoading';
import { useDocumentReady } from '../hooks/useDocumentReady';

export function ChatPage() {
	const ws = useWebsocket();
	const [ isLoadingManager, chats, sendMessage, setChatList ] = useMessageManager(ws);
	const [ currentChat, setCurrentChat ] = useState<LocalChat>(null);
	const documentReady = useDocumentReady();
	const { chatId } = useParams();
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		if(isLoadingManager) return;

		// Handle popup
		if(location.pathname == '/chat/new') {
			if(!currentChat) setCurrentChat(chats[0]);
			return;
		}

		// If no chat provided, navigate to last chat
		if(!chatId) navigate(`/chat/${currentChat?.id || chats[0].id}`);

		const chat: LocalChat = chats.find(c => c.id == chatId);
		// If id is not found, navigate to last chat
		if(!chat) navigate(`/chat/${chats[0].id}`);
		setCurrentChat(chats[0]);
	}, [ isLoadingManager, chatId, location ]);

	const isLoading = (
		isLoadingManager || !currentChat ||
		(!documentReady && document.location.hostname !== 'localhost')
	);
	if(isLoading) return (<MainLoading />);

	return (
		<MessageManagerContext.Provider value={[ chats, sendMessage, setChatList ]}>
			<Container fluid style={{'height': '100vh', 'maxHeight': '100vh', 'overflow': 'hidden'}}>
				<Row className='h-100'>
					<Col style={{'flex': '0 0 360px', 'width': '360px'}} className='border-separator border-end'>
						<UserInfo />
						<ChatList currentChat={currentChat} />
					</Col>
					<Col className='d-flex align-items-stretch flex-column mh-100'>
						<ChatInfo currentChat={currentChat} />
						<MessagesWindow currentChat={currentChat} />
						<MessageBar currentChat={currentChat} />
					</Col>
				</Row>
			</Container>
			{/* React Router outlet for popups */}
			<Outlet />
		</MessageManagerContext.Provider>
	);
}
