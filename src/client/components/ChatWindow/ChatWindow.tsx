import React from 'react';
import { LocalChat } from '../../types/Chat';
import ChatInfo from '../ChatInfo/ChatInfo';
import ChatList from '../ChatList/ChatList';
import FullPageContainer from '../FullPageContainer/FullPageContainer';
import MessageBar from '../MessageBar/MessageBar';
import MessagesWindow from '../MessagesWindow/MessagesWindow';
import UserInfo from '../UserInfo/UserInfo';

export interface ChatWindowProps {
    currentChat?: LocalChat
}

function ChatWindow({ currentChat }: ChatWindowProps) {
	return (
		<>
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
		</>
	);
}

export default  ChatWindow;
