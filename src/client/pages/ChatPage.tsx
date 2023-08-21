import React, { useContext, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import MainLoading from '../components/MainLoading/MainLoading';
import { MessageManagerContext } from '../context/MessageManagerContext';
import { OnlineManagerContext } from '../context/OnlineManagerContext';
import { UserContext } from '../context/UserContext';
import { useDocumentReady } from '../hooks/useDocumentReady';
import { useMessageManager } from '../hooks/useMessageManager';
import { useOnlineManager } from '../hooks/useOnlineManager';
import { useWebsocket } from '../hooks/useWebsocket';
import { LocalChat } from '../types/Chat';
import { usePageInfo } from '../hooks/usePageInfo';

const ChatWindowLazy = React.lazy(() => import('../components/ChatWindow/ChatWindow'));

function ChatPage() {
	const { chatId } = useParams();
	const ws = useWebsocket();
	const [
		isLoadingMessagesManager,
		chats,
		sendMessage,
		setChatList,
		fetchMoreChats,
		hasMoreChats,
		markChatAsRead
	] = useMessageManager(ws);
	const getOnlineStatus = useOnlineManager(ws);
	const [ currentChat, setCurrentChat ] = useState<LocalChat>(null);
	const [ user ] = useContext(UserContext);
	const documentReady = useDocumentReady();
	const navigate = useNavigate();
	const location = useLocation();

	const isPopup = ([
		'/chat/new',
		'/chat/profile',
		'/chat/email-confirm',
		'/chat/delete-account',
		'/chat/user',
		'/chat/invite/'
	].find(x => location.pathname.startsWith(x))) !== undefined;

	usePageInfo({
		title: !isPopup && currentChat ? currentChat.name : undefined,
		discordTitle: currentChat ? (currentChat.isGroup ? 'Chatting in group' : 'Chatting with'): undefined,
		discordDetails: currentChat?.name
	}, [ currentChat, location ]);

	/**
	 * Match current chat to url
	 */
	useEffect(() => {
		const isEmailConfirmRoute = location.pathname == '/chat/email-confirm';
		if (!user.isEmailConfirmed && !isEmailConfirmRoute) {
			navigate('/chat/email-confirm');
		}
		if (user.isEmailConfirmed && isEmailConfirmRoute) {
			navigate('/chat');
		}

		if (isLoadingMessagesManager || chats.length == 0) return setCurrentChat(null);
		const defaultChat = chats[0];

		if (!chatId && currentChat) {
			// If chat is selected but url is not updated, set url to current chat
			if (isPopup) return;
			navigate(`/chat/${currentChat.id}`);
		}
		else {
			// If nothing is set or chatId is provided
			const chat: LocalChat = chats.find(c => c.id == chatId);
			if (chat) setCurrentChat(chat);
			else if (!isPopup) navigate(`/chat/${defaultChat.id}`);
			else setCurrentChat(defaultChat);

		}
	}, [ isLoadingMessagesManager, chatId, location ]);

	/**
	 * Mark messages as read
	 */
	useEffect(() => {
		if(!currentChat) return;
		if(!currentChat.lastMessage) return;
		if(!currentChat.hasUnread) return;
		markChatAsRead(currentChat);
	}, [ currentChat, currentChat?.lastMessage ]);

	const isLoading = (
		isLoadingMessagesManager || !documentReady
	);

	if (isLoading) return (<MainLoading />);

	return (
		<React.Suspense fallback={<MainLoading />}>
			<OnlineManagerContext.Provider value={getOnlineStatus}>
				<MessageManagerContext.Provider value={[
					chats,
					sendMessage,
					setChatList,
					fetchMoreChats,
					hasMoreChats,
					markChatAsRead
				]}>
					<ChatWindowLazy currentChat={currentChat} />
					<Outlet context={currentChat} />
				</MessageManagerContext.Provider>
			</OnlineManagerContext.Provider>
		</React.Suspense>
	);
}

export default ChatPage;
