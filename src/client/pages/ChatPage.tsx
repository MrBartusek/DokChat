import React, { useContext, useEffect, useState } from 'react';
import { Alert, Col, Row } from 'react-bootstrap';
import ChatInfo from '../components/ChatInfo/ChatInfo';
import MessagesWindow from '../components/MessagesWindow/MessagesWindow';
import ChatList from '../components/ChatList/ChatList';
import UserInfo from '../components/UserInfo/UserInfo';
import MessageBar from '../components/MessageBar/MessageBar';
import { useWebsocket } from '../hooks/useWebsocket';
import { useMessageManager } from '../hooks/useMessageManager';
import { MessageManagerContext } from '../context/MessageManagerContext';
import { LocalChat } from '../types/Chat';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import MainLoading from '../components/MainLoading/MainLoading';
import { useDocumentReady } from '../hooks/useDocumentReady';
import FullPageContainer from '../components/FullPageContainer/FullPageContainer';
import EmailConfirmNotice from '../components/EmailConfirmNotice/EmailConfirmNotice';
import { UserContext } from '../context/UserContext';

export function ChatPage() {
	const ws = useWebsocket();
	const [ isLoadingManager, chats, sendMessage, setChatList ] = useMessageManager(ws);
	const { chatId } = useParams();
	const [ currentChat, setCurrentChat ] = useState<LocalChat>(null);
	const documentReady = useDocumentReady();
	const navigate = useNavigate();
	const location = useLocation();
	const [ user ] = useContext(UserContext);

	/**
	 * Load current chat
	 */
	useEffect(() => {
		if(isLoadingManager || chats.length == 0) return;
		const defaultChat = chats[0];
		const isPopup = [ '/chat/new', '/chat/profile', '/chat/email-confirm' ].includes(location.pathname);

		if(!chatId && currentChat) {
			// If chat is selected but url is not updated, set url to current chat
			if(isPopup) return;
			navigate(`/chat/${currentChat.id}`);
		}
		else {
			// If nothing is set or chatId is provided
			const chat: LocalChat = chats.find(c => c.id == chatId);
			if(chat) {
				setCurrentChat(chat);
			}
			else if(!isPopup) {
				navigate(`/chat/${defaultChat.id}`);
			}
			else {
				setCurrentChat(defaultChat);
			}
		}
	}, [ isLoadingManager, chatId, location ]);

	const isLoading = (
		isLoadingManager || (!documentReady && document.location.hostname !== 'localhost')
	);
	if(isLoading) return (<MainLoading />);

	return (
		<MessageManagerContext.Provider value={[ chats, sendMessage, setChatList ]}>
			<FullPageContainer className='d-flex flex-column p-0'>
				{ !user.isEmailConfirmed && <EmailConfirmNotice /> }
				<Row className='d-flex flex-fill m-0'>
					<Col
						style={{flex: '0 0 360px', width: '360px', minWidth: 0}}
						className='d-flex flex-column border-separator border-end'
					>
						<UserInfo />
						<ChatList
							currentChat={currentChat}
						/>
					</Col>
					<Col
						style={{minWidth: 0}}
						className='d-flex align-items-stretch flex-column h-100 p-0'
					>
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
