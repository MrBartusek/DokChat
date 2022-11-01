import React, { useContext, useEffect, useState } from 'react';
import { ChatListResponse, EndpointResponse } from '../../types/endpoints';
import { UserContext } from '../context/UserContext';
import { LocalChat } from '../types/Chat';
import { useFetch } from './useFetch';
import { useWebsocketType } from './useWebsocket';
import * as DateFns from 'date-fns';
import useSound from 'use-sound';

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
	const [ playPing ] = useSound('/sounds/new_message_ping.mp3', { volume: 0.5 });

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
				new LocalChat(chat)
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
				// If chat does not exist, add one to cache
				const newChat = msg.chat;
				newChat.lastMessage = {
					author: msg.author.username,
					content: msg.content,
					timestamp: msg.timestamp
				};
				chats.push(new LocalChat(newChat));
			}
			else {
				// Receive message
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
			playPing();
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

	function ackErrorMessage(chat: LocalChat, pendingId: string) {
		const chats = [ ...chatList ];
		const chatId = chats.findIndex((c) => c.id == chat.id);
		if(chatId == -1) return;
		chats[chatId].ackErrorMessage(pendingId);
		setChatList(chats);
	}

	function sortedChatList(): LocalChat[] {
		return [ ...chatList ].sort((a, b) => {
			return  Number(b.lastMessage?.timestamp || b.createdAt) - Number(a.lastMessage?.timestamp || a.createdAt);
		});
	}

	return [
		loading,
		sortedChatList(),
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
				if(response.error) {
					ackErrorMessage(data.chat, pendingMessageId);
				}
				else {
					ackMessage(data.chat, pendingMessageId, response.data.id, response.data.timestamp);
				}
			});
		},
		setChatList
	];
}
