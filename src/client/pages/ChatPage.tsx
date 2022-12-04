import React, { useContext, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import ChatInfo from '../components/ChatInfo/ChatInfo';
import ChatList from '../components/ChatList/ChatList';
import FullPageContainer from '../components/FullPageContainer/FullPageContainer';
import MainLoading from '../components/MainLoading/MainLoading';
import MessageBar from '../components/MessageBar/MessageBar';
import MessagesWindow from '../components/MessagesWindow/MessagesWindow';
import UserInfo from '../components/UserInfo/UserInfo';
import { MessageManagerContext } from '../context/MessageManagerContext';
import { UserContext } from '../context/UserContext';
import { useDocumentReady } from '../hooks/useDocumentReady';
import { useMessageManager } from '../hooks/useMessageManager';
import { useWebsocket } from '../hooks/useWebsocket';
import { LocalChat } from '../types/Chat';

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
		const isPopup = ([
			'/chat/new',
			'/chat/profile',
			'/chat/email-confirm',
			'/chat/delete-account'
		].includes(location.pathname));

		const isEmailConfirmRoute = location.pathname == '/chat/email-confirm';
		if(!user.isEmailConfirmed && !isEmailConfirmRoute) {
			navigate('/chat/email-confirm');
		}
		if(user.isEmailConfirmed && isEmailConfirmRoute) {
			navigate('/chat');
		}

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
				<div className='d-flex flex-fill m-0 flex-nowrap'>
					<div
						className='d-flex flex-column border-separator border-end'
					>
						<UserInfo />
						<ChatList currentChat={currentChat} />
					</div>
					<div className='d-flex flex-column p-0 flex-fill' style={{ minWidth: 0 }}>
						<ChatInfo currentChat={currentChat} />
						{currentChat && (
							<>
								<MessagesWindow currentChat={currentChat} />
								<MessageBar currentChat={currentChat} />
							</>
						)}
					</div>
				</div>
			</FullPageContainer>
			{/* React Router outlet for popups */}
			<Outlet context={currentChat} />
		</MessageManagerContext.Provider>
	);
}
