import React, { useContext, useEffect, useState } from 'react';
import { ChatListResponse, EndpointResponse } from '../../types/endpoints';
import { UserContext } from '../context/UserContext';
import { LocalChat } from '../types/Chat';
import { useFetch } from './useFetch';
import { useWebsocketType } from './useWebsocket';
import * as DateFns from 'date-fns';

/**
 * This hook is a manger for receiving, caching and sending messages
 * @return [loading, chats, sendMessage, setChatList]
 */
export function useMessageManager(ws: useWebsocketType): [
	boolean, // loading
	LocalChat[], // chats
	React.Dispatch<{chat: LocalChat, content: string}>, // sendMessage
	React.Dispatch<LocalChat[]> // setChatList
	] {
	const [ loading, setLoading ] = useState(true);
	const [ user ] = useContext(UserContext);

	const initialChatList = useFetch<EndpointResponse<ChatListResponse>>('chat/list', true);
	const [ chatList, setChatList ] = useState<LocalChat[]>([]);

	/**
     * Load initial chat list and cache it
     */
	useEffect(() => {
		if(initialChatList.loading) return;
		const rawChats = initialChatList.res.data;
		setChatList(
			rawChats.map((chat) => (
				new LocalChat(
					chat.id,
					chat.name,
					chat.avatar,
					chat.isGroup,
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
			const chats = [ ...chatList ];
			const chat = chats.find((c) => c.id == msg.chat.id);
			if(!chat) {
				chats.push(new LocalChat(
					msg.chat.id,
					msg.chat.name,
					msg.chat.avatar,
					msg.chat.isGroup
				));
			}
			else {
				chat.addMessage({
					content: msg.content,
					author: msg.author,
					id: msg.messageId,
					timestamp: msg.timestamp
				});
				chat.avatar = msg.chat.avatar;
				chat.name = msg.chat.name;
			}
			setChatList(chats);
		});
		return () => {
			ws.socket.off('message');
		};
	});

	function ackMessage(chat: LocalChat, pendingId: string, newId: string, timestamp: string) {
		const chats = [ ...chatList ];
		const chatId = chats.findIndex((c) => c.id == chat.id);
		if(chatId == -1) return;
		chats[chatId].ackMessage(pendingId, newId, timestamp);
		setChatList(chats);
	}

	return [
		loading,
		chatList,
		(data: {chat: LocalChat, content: string}) => {
			// Add this message to local cache
			const chats = [ ...chatList ];
			const chatId = chats.findIndex((c) => c.id == data.chat.id);
			if(chatId == -1) return;
			const pendingMessageId = chats[chatId].addMessage({
				id: '0', // This will be auto-generated
				isPending: true,
				author: {
					id: user.id,
					username: user.username,
					avatar: user.avatarUrl,
					tag: user.tag
				},
				content: data.content,
				timestamp: DateFns.getUnixTime(new Date()).toString()
			});
			setChatList(chats);

			// Send message to WS
			ws.socket.emit('message', {
				chatId: data.chat.id,
				content: data.content
			}, (response) => {
				if(response.error) return;
				ackMessage(data.chat, pendingMessageId, response.data.id, response.data.timestamp);
			});
		},
		setChatList
	];
}
