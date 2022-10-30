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
import FullPageContainer from '../components/FullPageContainer/FullPageContainer';

export function ChatPage() {
	const ws = useWebsocket();
	const [ isLoadingManager, chats, sendMessage, setChatList ] = useMessageManager(ws);
	const [ currentChat, setCurrentChat ] = useState<LocalChat>(null);
	const { chatId } = useParams();
	const documentReady = useDocumentReady();
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		if(isLoadingManager || chats.length == 0) return;

		// Handle popup
		if([ '/chat/new', '/chat/profile' ].includes(location.pathname)) {
			if(!currentChat) setCurrentChat(chats[0]);
			return;
		}

		// If no chat provided, navigate to last chat
		if(!chatId) navigate(`/chat/${currentChat?.id || chats[0].id}`);

		const chat: LocalChat = chats.find(c => c.id == chatId);
		if(!chat) navigate(`/chat/${chats[0].id}`);
		setCurrentChat(chat);
	}, [ isLoadingManager, chatId, location ]);

	const isLoading = (
		isLoadingManager || (!documentReady && document.location.hostname !== 'localhost')
	);
	if(isLoading) return (<MainLoading />);

	return (
		<MessageManagerContext.Provider value={[ chats, sendMessage, setChatList ]}>
			<FullPageContainer>
				<Row className='h-100'>
					<Col style={{'flex': '0 0 360px', 'width': '360px'}} className='border-separator border-end'>
						<UserInfo />
						<ChatList
							currentChat={currentChat}
							setCurrentChat={setCurrentChat}
						/>
					</Col>
					<Col className='d-flex align-items-stretch flex-column mh-100'>
						<ChatInfo currentChat={currentChat} />
						{currentChat && (
							<>
								<MessagesWindow currentChat={currentChat} />
								<MessageBar currentChat={currentChat} />
							</>
						)}
					</Col>
				</Row>
			</FullPageContainer>
			{/* React Router outlet for popups */}
			<Outlet />
		</MessageManagerContext.Provider>
	);
}
