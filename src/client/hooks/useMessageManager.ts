import { Buffer } from 'buffer';
import * as DateFns from 'date-fns';
import React, { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import useSound from 'use-sound';
import { ATTACHMENT_MAX_SIZE } from '../../types/const';
import { ChatListResponse, EndpointResponse } from '../../types/endpoints';
import { ClientMessage, ServerMessage } from '../../types/websocket';
import { SettingsContext } from '../context/ThemeContext';
import { UserContext } from '../context/UserContext';
import { LocalChat } from '../types/Chat';
import { useFetch } from './useFetch';
import { useWebsocketType } from './useWebsocket';
import Utils from '../helpers/utils';
import { useNavigate } from 'react-router';
import getAxios from '../helpers/axios';

/**
 * This hook is a manger for receiving, caching and sending messages
 * @return [loading, chats, sendMessage, setChatList]
 */
export function useMessageManager(ws: useWebsocketType): [
	boolean, // loading
	LocalChat[], // chats
	(chat: LocalChat, content?: string, attachment?: File) => Promise<void>, // sendMessage
	React.Dispatch<LocalChat[]>, // setChatList
	(count?: number) => void, // fetchMoreChats
	boolean, // hasMore
	(chat: LocalChat) => void, // markChatAsRead
] {
	const [ loading, setLoading ] = useState(true);
	const [ user ] = useContext(UserContext);
	const [ playPing ] = useSound(Utils.getBaseUrl() + '/sounds/new_message_ping.mp3', { volume: 0.5 });
	const [ settings ] = useContext(SettingsContext);
	const navigate = useNavigate();
	const [ chatList, setChatList ] = useState<LocalChat[]>([]);
	const [ hasMore, setHasMore ] = useState(true);

	/**
	 * Load initial chat list and cache it
	 */
	useEffect(() => {
		setLoading(true);
		fetchMoreChats(25);
	}, []);

	async function fetchMoreChats(count = 10) {
		const axios = getAxios(user);
		let url = `/chat/list?count=${count}`;
		if (chatList.length > 0) {
			const lastChat = chatList[chatList.length -1];
			url += `&lastCoalesceTimestamp=${lastChat.lastMessage?.timestamp || lastChat.createdAt}`;
		}
		await axios.get(url)
			.then((r) => {
				const resp: EndpointResponse<ChatListResponse> = r.data;
				const rawChats = resp.data;
				const newChats = rawChats.map((chat) => new LocalChat(chat, user));
				setChatList([ ...chatList, ...newChats ]);
				if (rawChats.length < count) {
					setHasMore(false);
				}
			}).catch((error) => {
				console.error('Failed to load more chats', error);
			}).finally(() => {
				setTimeout(() => setLoading(false), 300);
			});
	}

	/**
	 * Message receive
	 */
	useEffect(() => {
		ws.socket.on('message', async (msg) => {
			const chats = [ ...chatList ];
			const chat = chats.find((c) => c.id == msg.chat.id);

			if (!chat) {
				// If chat does not exist, add one to cache
				const newChat = msg.chat;
				newChat.lastMessage = {
					id: msg.id,
					author: msg.author.username,
					content: msg.content,
					timestamp: msg.timestamp
				};
				chats.push(new LocalChat(newChat, user));
			}
			else {
				// Receive message
				chat.addMessage(msg);
				chat.avatar = msg.chat.avatar;
				chat.name = msg.chat.name;
				chat.color = msg.chat.color;
			}
			setChatList(chats);
			onNewMessage(msg);
		});
		return () => {
			ws.socket.off('message');
		};
	});

	async function onNewMessage(msg: ServerMessage) {
		if (settings.soundNotifications && !msg.isSystem) playPing();
		if(Utils.isElectron() && settings.desktopNotifications) {
			const isFocused = await window.electron.isFocused();
			if(isFocused) return;
			const notification = new Notification(msg.author?.username ?? msg.chat.name, {
				body: msg.content ?? 'Sent an attachment',
				silent: true
			});
			notification.onclick = () => {
				navigate(`/chat/${msg.chat.id}`);
				window.electron.focus();
			};
		}
	}

	function ackMessage(chat: LocalChat, pendingId: string, newId: string, timestamp: string) {
		const chats = [ ...chatList ];
		const chatId = chats.findIndex((c) => c.id == chat.id);
		if (chatId == -1) return;
		chats[chatId].ackMessage(pendingId, newId, timestamp);
		setChatList(chats);
	}

	function ackErrorMessage(chat: LocalChat, pendingId: string) {
		const chats = [ ...chatList ];
		const chatId = chats.findIndex((c) => c.id == chat.id);
		if (chatId == -1) return;
		chats[chatId].ackErrorMessage(pendingId);
		setChatList(chats);
	}

	function sortedChatList(): LocalChat[] {
		return [ ...chatList ].sort((a, b) => {
			return Number(b.lastMessage?.timestamp || b.createdAt) - Number(a.lastMessage?.timestamp || a.createdAt);
		});
	}

	async function sendMessage(chat: LocalChat, content?: string, attachment?: File) {
		if (attachment && attachment.size > ATTACHMENT_MAX_SIZE) {
			toast.error('Max attachments size is 25MB');
			return;
		}

		// Add this message to local cache
		const chats = [ ...chatList ];
		const chatId = chats.findIndex((c) => c.id == chat.id);
		if (chatId == -1) return;
		const pendingMessageId = chats[chatId].addMessage({
			id: '0', // This will be auto-generated
			isPending: true,
			isSystem: false,
			attachment: {
				hasAttachment: attachment != undefined,
				mimeType: attachment && attachment.type
			},
			author: {
				id: user.id,
				username: user.username,
				avatar: user.avatar,
				tag: user.tag
			},
			content: content,
			timestamp: DateFns.getUnixTime(new Date()).toString()
		});
		setChatList(chats);

		// Send message to WS
		const message: ClientMessage = {
			chatId: chat.id,
			content: content
		};
		if (attachment) {
			const arrBuffer = await attachment.arrayBuffer();
			message.attachment = {
				buffer: Buffer.from(arrBuffer),
				mimeType: attachment.type
			};
		}
		ws.socket.emit('message', message, (response) => {
			if (response.error) {
				ackErrorMessage(chat, pendingMessageId);
				console.error('Failed to send message', response);
			}
			else {
				ackMessage(chat, pendingMessageId, response.data.id, response.data.timestamp);
			}
		});
	}

	function markChatAsRead(chat: LocalChat) {
		const lastMessage = chat.messages.filter(m => !m.isPending)[0];
		if(!lastMessage) return;
		ws.socket.emit('messageRead', chat.id, lastMessage.id, (response) => {
			if (response.error) {
				console.error('Failed to mark message as read', response);
			}
			else {
				chat.hasUnread = false;
			}
		});
	}

	return [
		loading,
		sortedChatList(),
		sendMessage,
		setChatList,
		fetchMoreChats,
		hasMore,
		markChatAsRead
	];
}
