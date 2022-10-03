import { useContext, useEffect, useState } from 'react';
import { ChatListResponse, EndpointResponse } from '../../types/endpoints';
import { UserContext } from '../context/UserContext';
import { Chat } from '../types/chat';
import { useFetch } from './useFetch';
import { useWebsocketType } from './useWebsocket';

/**
 * This hook is a manger for receiving, caching and sending messages
 * @return [loading, chats, sendMessage]
 */
export function useMessageManager(ws: useWebsocketType): [boolean, Chat[], React.Dispatch<{chat: Chat, content: string}>] {
	const [loading, setLoading] = useState(true);
	const [user] = useContext(UserContext);

	const initialChatList = useFetch<EndpointResponse<ChatListResponse>>('chat/list', true);
	const [chatList, setChatList] = useState<Chat[]>([]);

	/**
     * Load initial chat list and cache it
     */
	useEffect(() => {
		if(initialChatList.loading) return;
		const rawChats = initialChatList.res.data;
		setChatList(
			rawChats.map((chat) => (
				new Chat(
					chat.id,
					chat.name,
					chat.avatar,
					chat.lastMessage ? chat.lastMessage : undefined
				)
			))
		);
		setLoading(false);
	}, [ initialChatList ]);

	/**
	 * Message receive
	 */
	useEffect(() => {
		ws.socket.on('message', (msg) => {
			const chat = chatList.find((c) => c.id == msg.chat.id);
			if(!chat) {
				chatList.push(new Chat(
					msg.chat.id,
					msg.chat.name,
					msg.chat.avatar
				));
			}
			else {
				chat.addMessage({
					content: msg.content,
					author: msg.author
				});
			}
			setChatList(chatList);
		});
		return () => {
			ws.socket.off('message');
		};
	});

	return [
		loading,
		chatList,
		(data: {chat: Chat, content: string}) => {
			// Send message to WS
			ws.socket.send('message', {
				chatId: data.chat.id,
				content: data.content
			});

			// Add this message to local cache
			const chat = chatList.find((c) => c.id == data.chat.id);
			if(!chat) return;
			chat.addMessage({
				author: {
					id: user.id,
					username: user.username,
					avatar: user.avatarUrl
				},
				content: data.content
			});
			setChatList(chatList);
		}
	];
}
